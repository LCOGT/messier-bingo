from django.conf import settings
from django.conf import settings
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import Group
from django.contrib.auth.models import User, check_password
from django.contrib.sessions.backends.db import SessionStore
from django.core.exceptions import ImproperlyConfigured
from django_tools.middlewares import ThreadLocal
from django.db import connections
from .models import Proposal
import hashlib
import logging
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


def matchRBauthPass(email,password):
    # Retreive the database user information from the settings
    # Match supplied user name to one in Drupal database
    sql_users = "SELECT username, password, first_name, last_name, id FROM auth_user WHERE email = '%s'" % email
    with connections['rbauth'].cursor() as c:
        c.execute(sql_users)
        user = c.fetchone()
    if user:
        if check_password(password,user[1]):
            proposals = get_odin_cookie_proposals(email, password)
            return user[0], user[1], user[2], user[3], user[4], proposals
        else:
            ###### If the user does not have an email address return false
            logger.debug("password failed for %s" % email)
            return False
    else:
        logger.debug("User %s not found" % email)
        return False

def checkUserObject(email,username,password,first_name,last_name, user_id):
    # Logging in can only be done using email address if using RBauth
    user, created = User.objects.get_or_create(username=username)
    if not created:
        if not check_password(password,user.password):
            user.set_password(password)
        if user.first_name != first_name:
            user.first_name == first_name
        if user.last_name != last_name:
            user.last_name == last_name
        if user.email != email:
            user.email == email
        user.save()
        logger.debug("User found %s" % user)
    else:
        user.first_name == first_name
        user.last_name == last_name
        user.email == email
        user.save()
        logger.debug("User created")
    return user

def get_odin_cookie_proposals(email, password):
    '''
    Use login credentials to login to ODIN as well and add sessionid to Messier Bingo session
    while the session is open get the user's proposal list
    '''
    client = requests.session()
    url = 'https://lcogt.net/observe/auth/accounts/login/'
    r = requests.get(url)
    token = r.cookies['csrftoken']
    r = client.post(url, data={'username':email,'password':password, 'csrfmiddlewaretoken' : token}, cookies={'csrftoken':token})
    try:
        page = client.get('http://lcogt.net/observe/proposal/', timeout=20.0)
        proposals = get_epo_proposals(page)
    except requests.exceptions.ReadTimeout:
        logger.error('Could not obtain proposals. Timed out.')
    try:
        request = ThreadLocal.get_current_request()
        request.session['odin.sessionid'] = client.cookies['odin.sessionid']
        return proposals
    except Exception, e:
        logger.error(client.cookies)
        return False

def get_epo_proposals(page):
    '''
    Parse the Propsals listing page for all the proposal ids the logged in user is a member of
    '''
    proposals = []
    soup = BeautifulSoup(page.content, 'html.parser')
    for line in soup.find_all("div", class_="projecttitle"):
        proposals.append(line.find('a').get('href').split('/')[-2])
    logger.debug("Found approved proposals: %s" ", ".join(proposals))
    return set(proposals)

def add_proposal_to_session(proposals):
    approved_p = Proposal.objects.filter(active=True).values_list('code', flat=True)
    usable_proposals = proposals.intersection(list(approved_p))
    if usable_proposals:
        value = list(usable_proposals)[0]
        logger.debug("Proposal %s added to session" % value)
    else:
        value = None
        logger.debug("No proposals added to session")
    request = ThreadLocal.get_current_request()
    request.session['proposal_code'] = value
    return


class LCOAuthBackend(ModelBackend):
    def authenticate(self, username=None, password=None):
        # This is only to authenticate with RBauth
        # If user cannot log in this way, the normal Django Auth is used
        response =  matchRBauthPass(username, password)
        proposals = response[5]
        if (response):
            user = checkUserObject(username,response[0],password,response[2],response[3], response[4])
            # Check for EPO proposals and add the first found to the session
            if not proposals:
                logger.debug('No proposals found')
            else:
                add_proposal_to_session(proposals)
            return user
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
