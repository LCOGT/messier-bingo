from datetime import datetime

from django.conf import settings
from django.contrib.sessions.backends.db import SessionStore
import requests
import logging
import json


logger = logging.getLogger(__name__)

def process_observation_request(params, token):
    '''
    Send the observation parameters and the authentication cookie to the Scheduler API
    '''
    headers = {'Authorization': 'Token {}'.format(token)}
    url = settings.PORTAL_REQUEST_API
    try:
        r = requests.post(url, json=params, headers=headers, timeout=20.0)
    except requests.exceptions.Timeout:
        msg = "Observing portal API timed out"
        logger.error(msg)
        params['error_msg'] = msg
        return False, msg

    if r.status_code in [200,201]:
        logger.debug('Submitted request')
        return True, False
    else:
        logger.error("Could not send request: {}".format(r.content))
        return False, r.content

def request_format(object_name, object_ra, object_dec, start,end, obs_filter, proposal, aperture='0m4'):
    '''
    Format a simple request using the schema the Scheduler understands
    '''
    default_camera = settings.DEFAULT_CAMERAS[aperture]

# this selects any telescope on the 1 meter network
    location = {
        'telescope_class' : aperture,
        }
    molecules = []

    f_str = json.loads(obs_filter)
    for f in f_str:
        molecule = {
            # Required fields
            'exposure_time'   : f['exposure'],   # Exposure time, in secs
            'exposure_count'  : 1,     # The number of consecutive exposures
            'filter'          : f['name'],            # The generic filter name
             # Optional fields. Defaults are as below.
            'type'            : 'EXPOSE',  # The type of the molecule
            'instrument_name' : default_camera, # This resolves to the main science camera on the scheduled resource
            'bin_x'           : 2,                 # Your binning choice. Right now these need to be the same.
            'bin_y'           : 2,
            'defocus'       : 0.0             # Mechanism movement of M2, or how much focal plane has moved (mm)
            }
        molecules.append(molecule)

    # define the target
    target = {
           'name'              : object_name,
           'ra'                : object_ra, # RA (degrees)
           'dec'               : object_dec, # Dec (Degrees)
           'epoch'             : 2000,
           'type'              : 'SIDEREAL'
        }

    # Do the observation between these dates
    window = {
        'start' : start, # str(datetime)
        'end' : end, # str(datetime)
        }

    request = {
        "constraints" : {'max_airmass' : 1.6},
        "location" : location,
        "molecules" : molecules,
        "observation_note" : "Messier Bingo Request",
        "target" : target,
        "type" : "request",
        "windows" : [window],
        }

    user_request = {
        "operator" : "SINGLE",
        "requests" : [request],
        "type" : "compound_request",
        "ipp_value" : 1.0,
        "group_id": "mb_{}_{}".format(object_name, datetime.utcnow().strftime("%Y%m%d")),
        "observation_type": "NORMAL",
        "proposal": proposal
        }

    #final_request = json.dumps(user_request)
    return user_request
