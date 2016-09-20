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
            settings.ODIN_OAUTH_CLIENT['TOKEN_URL'],
            data={
                'grant_type': 'password',
                'username': username,
                'password': password,
                'client_id': settings.ODIN_OAUTH_CLIENT['CLIENT_ID'],
                'client_secret': settings.ODIN_OAUTH_CLIENT['CLIENT_SECRET']
            }
        )
        if response.status_code == 200:
            user, created = User.objects.get_or_create(username=username)
            access_token = response.json()['access_token']
            proposal_response = requests.get(
                settings.ODIN_OAUTH_CLIENT['PROPOSALS_URL'],
                headers={'Authorization': 'Bearer {}'.format(access_token)}
            )
            if proposal_response.status_code == 200:
                add_proposal_to_session(
                    set([p['code'] for p in proposal_response.json()])
                )
                request = ThreadLocal.get_current_request()
                request.session['bearer_token'] = access_token
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
