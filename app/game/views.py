from messierbingo.models import MessierObject, Telescope
from rest_framework import viewsets
from django.shortcuts import render
from django.conf import settings
from .serializers import ImageSerializer
import requests
from django.contrib.auth.forms import AuthenticationForm


class ImageViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows images of Messier catalogue objects to be shared with the Messier Bingo game.
    """
    queryset = MessierObject.objects.all()
    serializer_class = ImageSerializer

    def get_object(self):
        mobj = MessierObject.objects.get(name=self.kwargs['slug'])
        return mobj

def home(request):
    form = AuthenticationForm()
    return render(request,'index.html',{'login_form':form})

def process_observation_request(params):
    client = requests.session()
    url = 'https://lcogt.net/observe/service/request/submit'
    cookie = 
    r = client_sub.post(url, cookies=cookie, data=params)
    if r.status_code == '200':
        return True
    else:
        logger.error(r.content)
        return False

def request_format(proposal, object_name, object_ra, object_dec, exp_time, obs_filter ='r', aperture='1m0'):
    default_camera = settings.DEFAULT_CAMERAS[aperture]
    constraints = {'max_airmass' : 3.0}

# this selects any telescope on the 1 meter network
    location = {
        'telescope_class' : '1m0',
        }

    proposal = {
        'proposal_id'   : 'LCOEPO2015A-001',
        }

    molecule = {
        # Required fields
        'exposure_time'   : exp_time,   # Exposure time, in secs
        'exposure_count'  : 1,     # The number of consecutive exposures
        'filter'          : obs_filter,            # The generic filter name
         # Optional fields. Defaults are as below.
        'type'            : 'EXPOSE',  # The type of the molecule
        'ag_name'         : '',           # '' to let it resolve; same as instrument_name for self-guiding
        'ag_mode'         : 'Optional',
        'instrument_name' : default_camera, # This resolves to the main science camera on the scheduled resource
           'bin_x'           : 2,                 # Your binning choice. Right now these need to be the same.
           'bin_y'           : 2,
           'defocus'       : 0.0             # Mechanism movement of M2, or how much focal plane has moved (mm)
            }

    # define the target
    target = {
           'name'              : object_name,
           'ra'                : object_ra, # RA (degrees)
           'dec'               : object_dec, # Dec (Degrees)
           'epoch'             : 2000,
        }

    # this is the actual window
    window = {
        'start' : '2015-08-12T10:00:00', # str(datetime)
        'end' : '2015-08-14T10:00:00', # str(datetime)
        }

    request = {
        "constraints" : constraints,
        "location" : location,
        "molecules" : [molecule],
        "observation_note" : "",
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
    return user_request

def submit_block_to_scheduler(params):
    request = Request()

# Create Location (site, observatory etc) and add to Request
    location = make_location(params)
    logger.debug("Location=%s" % location)
    request.set_location(location)
# Create Target (pointing) and add to Request
    logger.debug("Making a static object")
    target = make_target(params)
    logger.debug("Target=%s" % target)
    request.set_target(target)
# Create Window and add to Request
    window = make_window(params)
    logger.debug("Window=%s" % window)
    request.add_window(window)
# Create Molecule and add to Request
    molecule = make_molecule(params)
    request.add_molecule(molecule) # add exposure to the request
    request.set_note('Submitted by NEOexchange')
    logger.debug("Request=%s" % request)

    request.set_constraints({'max_airmass' : 2.0})

# Add the Request to the outer User Request
    user_request =  UserRequest(group_id=params['group_id'])
    user_request.add_request(request)
    user_request.operator = 'single'
    proposal = make_proposal(params)
    user_request.set_proposal(proposal)

# Make an endpoint and submit the thing
    client = SchedulerClient(settings.SCHEDULER_URL)
    response_data = client.submit(user_request)
    client.print_submit_response()
    request_numbers =  response_data.get('request_numbers', '')
    tracking_number =  response_data.get('tracking_number', '')
#    request_numbers = (-42,)
    if not tracking_number or not request_numbers:
        logger.error("No Tracking/Request number received")
        return False, params
    request_number = request_numbers[0]
    logger.info("Tracking, Req number=%s, %s" % (tracking_number,request_number))

    return tracking_number, params

def make_location(params):
    location = {
        'telescope_class' : '1m0',
        # 'site'        : '',
        # 'observatory' : '',
        # 'telescope'   : '',
    }
    return location

def make_target(params):
    '''Make a target dictionary for the request. RA and Dec need to be
    decimal degrees'''

    ra_degs = math.degrees(params['ra_rad'])
    dec_degs = math.degrees(params['dec_rad'])
    target = {
               'name' : params['source_id'],
               'ra'   : ra_degs,
               'dec'  : dec_degs
             }
    return target

def make_window(params):
    '''Make a window. This is simply set to the start and end time from
    params (i.e. the picked time with the best score plus the block length),
    formatted into a string.
    Hopefully this will prevent rescheduling at a different time as the
    co-ords will be wrong in that case...'''
    start = datetime.now()
    end = start+timedelta(days=7)
    window = {
              'start' : start.strftime('%Y-%m-%dT%H:%M:%S'),
              'end'   : end.strftime('%Y-%m-%dT%H:%M:%S'),
             }

    return window

def make_molecule(exposure_time):
    molecule = {
                'exposure_count'  : '',
                'exposure_time' : exposure_time,
                'bin_x'       : params['binning'],
                'bin_y'       : params['binning'],
                'instrument_name'   : params['instrument'],
                'filter'      : params['filter'],
                'ag_mode'     : 'Optional', # 0=On, 1=Off, 2=Optional.  Default is 2.
                'ag_name'     : ''

    }
    return molecule

def make_proposal(params):
    '''Construct needed proposal info'''
    if proposal[0:3] == 'FTP':
        tag_id = 'FTP'
    else:
        tag_id = 'LCOEPO'

    proposal = {
                 'proposal_id'   : params['proposal_id'],
                 'user_id'       : params['user_id'],
                 'tag_id'        : tag_id,
                 'priority'      : '30',
               }
    return proposal


