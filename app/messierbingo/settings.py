import os, sys

TEST = 'test' in sys.argv
COMPRESS_ENABLED = True

ADMINS = (
    # ('Your Name', 'your_email@example.com'),
)

CURRENT_PATH = os.path.dirname(os.path.realpath(__file__))

PRODUCTION = True if CURRENT_PATH.startswith('/var/www') else False
DEBUG = os.environ.get('DEBUG', True)

HOME = os.environ.get('HOME','/tmp')

MANAGERS = ADMINS

DATABASES = {
    'default': {
        'NAME': os.environ.get('DB_NAME', ''),
        "USER": os.environ.get('DB_USER', ''),
        "PASSWORD": os.environ.get('DB_PASSWD', ''),
        "HOST": os.environ.get('DB_HOST', ''),
        "PORT": "3306",
        "OPTIONS": {'init_command': 'SET storage_engine=INNODB'} if PRODUCTION else {},
        "ENGINE": "django.db.backends.mysql",
        },
}

# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.4/ref/settings/#allowed-hosts
ALLOWED_HOSTS = ['.lco.gtn','.lcogt.net','dockerhost','localhost','.lco.global']

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'UTC'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-gb'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = False

ADMIN_TITLE = 'Messier Bingo admin'
# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = os.path.join(CURRENT_PATH ,'media')

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = ''

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATICFILES_DIRS = ['/var/www/apps/messierbingo/game/static/', ]
STATIC_ROOT = '/var/www/html/static/'
STATIC_URL = '/static/'

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'bhdpj&amp;+k0@8@h1z417f$#%&amp;1i1m_8-41bvv)7t*j@n-4ww^0=%'

MIDDLEWARE_CLASSES = (
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

AUTHENTICATION_BACKENDS = (
    'messierbingo.auth_backend.ValhallaBackend',
    'django.contrib.auth.backends.ModelBackend',
    )

ROOT_URLCONF = 'messierbingo.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'messierbingo.wsgi.application'

LOGIN_REDIRECT_URL = '/'

SESSION_COOKIE_NAME = "messierbingo.sessionid"

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': '',
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    )
}

COMPRESS_JS_FILTERS = [
    'compressor.filters.template.TemplateFilter',
]

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'rest_framework',
    'cards',
    'game'
)

DEFAULT_CAMERAS = { '1m0' : '1M0-SCICAM-SBIG',
                    '2m0' : '2M0-SCICAM-SPECTRAL',
                    '0m4' : '0M4-SCICAM-SBIG'
                    }

# # A sample logging configuration. The only tangible logging
# # performed by this configuration is to send an email to
# # the site admins on every HTTP 500 error when DEBUG=False.
# # See http://docs.djangoproject.com/en/dev/topics/logging for
# # more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        },

    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
        'messierbingo' : {
            'handlers' : ['console'],
            'level'    : 'DEBUG',
        },
        'game' : {
            'handlers' : ['console'],
            'level'    : 'DEBUG',
        },
    }
}
ODIN_OAUTH_CLIENT = {
    'CLIENT_ID': os.environ.get('OAUTH_CLIENT_ID'),
    'CLIENT_SECRET': os.environ.get('OAUTH_CLIENT_SECRET'),
    'TOKEN_URL': 'https://lco.global/observe/o/token/',
    'PROPOSALS_URL': 'https://lco.global/observe/api/proposals/',
    'PROFILE_URL': 'https://lco.global/observe/api/profile/',
}

PORTAL_API_URL = 'https://observe.lco.global/api/'
PORTAL_REQUEST_API = PORTAL_API_URL + 'userrequests/'
PORTAL_TOKEN_URL = PORTAL_API_URL + 'api-token-auth/'
PORTAL_PROFILE_API = PORTAL_API_URL + 'profile/'

if not CURRENT_PATH.startswith('/var/www'):
    try:
        from local_settings import *
    except ImportError as e:
        if "local_settings" not in str(e):
            raise e
