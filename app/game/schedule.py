from django.conf import settings
from django.contrib.sessions.backends.db import SessionStore
import requests
import logging
import json


logger = logging.getLogger('django')

def process_observation_request(params, bearer_token):
    '''
    Send the observation parameters and the authentication cookie to the Scheduler API
    '''
    logger.error(bearer_token)
    headers = {'Authorization': 'Bearer {}'.format(bearer_token)}
    url = 'https://lcogt.net/observe/service/request/submit'
    r = requests.post(url, data=params, headers=headers)
    if r.status_code == 200:
        return True, False
    else:
        logger.error("Could not send request: {}".format(r.content))
        return False, r.content

def request_format(object_name, object_ra, object_dec, start,end, obs_filter, aperture='0m4'):
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
            'ag_name'         : '',           # '' to let it resolve; same as instrument_name for self-guiding
            'ag_mode'         : 'Optional',
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
        }

    # Do the observation between these dates
    window = {
        'start' : start, # str(datetime)
        'end' : end, # str(datetime)
        }

    request = {
        "constraints" : {'max_airmass' : 2.0},
        "location" : location,
        "molecules" : molecules,
        "observation_note" : "Messier Bingo Request",
        "observation_type" : "NORMAL",
        "target" : target,
        "type" : "request",
        "windows" : [window],
        }

    user_request = {
        "operator" : "single",
        "requests" : [request],
        "type" : "compound_request"
        }
    final_request = json.dumps(user_request)
    return final_request
