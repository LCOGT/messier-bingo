from django.conf import settings
from django_tools.middlewares import ThreadLocal
from messierbingo.models import Proposal
from django.contrib.auth.models import User
import logging
import requests

logger = logging.getLogger(__name__)


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


class OAuth2Backend(object):
    """
    Authenticate against the Oauth backend, using
    grant_type: password
    """

    def authenticate(self, username=None, password=None):
        response = requests.post(
            settings.PORTAL_TOKEN_URL,
            data={
                'username': username,
                'password': password,
            }
        )
        if response.status_code == 200:
            user, created = User.objects.get_or_create(username=username)
            access_token = response.json()['token']
            profile = requests.get(
                settings.PORTAL_PROFILE_API,
                headers={'Authorization': 'Token {}'.format(access_token)}
            )
            if profile.status_code == 200:
                add_proposal_to_session(
                    set([p['id'] for p in profile.json()['proposals']])
                )
                request = ThreadLocal.get_current_request()
                request.session['token'] = access_token
            else:
                logger.warn(
                    'User auth token was invalid!',
                    extra={'tags': {'username': username}}
                )
            return user
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
