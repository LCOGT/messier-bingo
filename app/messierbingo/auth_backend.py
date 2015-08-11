from django.conf import settings
from django.conf import settings
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import Group
from django.contrib.auth.models import User, check_password
from django.contrib.sessions.backends.db import SessionStore
from django.core.exceptions import ImproperlyConfigured
from django.db import connections
from .models import Proposal
import hashlib
import logging

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
            return user[0], user[1], user[2], user[3], user[4]
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
        # LookUP proposals they are a member of
    resp = add_proposal_to_session(user_id)
    if not resp:
        logger.debug("Looking up proposal failed")
    return user   

def get_odin_cookie(email, password):
    client = requests.session()
    url = 'https://lcogt.net/observe/auth/accounts/login/'
    r = requests.get(url_auth)
    cookie = 
    r = client.post(url, cookies=cookie, data={'username':email,'password':password, csrfmiddlewaretoken : r.cookies['csrftoken']})
    if r.status_code == '200':
        s = SessionStore()
        s['odin.sessionid'] = client.cookies['odin.sessionid']
        s.save()
        return True
    else:
        logger.error(r.content)
        return False

def epo_proposals(user_id):
    sql = """
        SELECT scheduler_requests.proposaldb_proposal.proposal_id 
            FROM scheduler_requests.proposaldb_proposal, rbauth.rbauth_userrole
            WHERE scheduler_requests.proposaldb_proposal.id = rbauth.rbauth_userrole.object_id
            AND content_type_id=12 AND user_id=%s AND scheduler_requests.proposaldb_proposal.public=1
        """
    with connections['rbauth'].cursor() as c:
        c.execute(sql, [user_id])
        ps = c.fetchall()
    proposals = set([p[0] for p in ps])
    return proposals

def add_proposal_to_session(user_id):
    proposals = epo_proposals(user_id)
    approved_p = Proposal.objects.filter(active=True).values_list('code', flat=True)
    usable_proposals = proposals.intersection(list(approved_p))
    if usable_proposals:
        value = list(usable_proposals)[0]
    else:
        return False
    s = SessionStore()
    s['proposal_code'] = value
    s.save()
    return True

         
class LCOAuthBackend(ModelBackend):         
    def authenticate(self, username=None, password=None):
        # This is only to authenticate with RBauth
        # If user cannot log in this way, the normal Django Auth is used
        response =  matchRBauthPass(username, password)
        if (response):
            return checkUserObject(username,response[0],password,response[2],response[3], response[4])
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None  

            
