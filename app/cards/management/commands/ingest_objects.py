from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from messierbingo.models import Telescope, MessierObject
import os
import glob
import json
from datetime import datetime

class Command(BaseCommand):
    args = '<number>'
    help = 'Read in all existing JSON files creating a db'
    
    def handle(self, *args, **options):
        folder = os.path.join(settings.MEDIA_ROOT,'db')
        files = glob.glob(folder+"/*.json")
        self.stdout.write('Found %s files\n' % len(files))
        for the_file in files:
            info = json.load(open(the_file))
            data = info['observation']
            telescope, created = Telescope.objects.get_or_create(name=data['instr']['tel'])
            names = data['label'].split(' ')
            mo, created = MessierObject.objects.get_or_create(name=names[0])
            mo.dec = data['dec']
            mo.ra = data['ra']
            mo.image = data['image']['about']
            mo.image_thumb = data['image']['thumb']
            mo.observer_name = data['observer']['label']
            mo.telescope = telescope
            try:
                mo.obs_date = datetime.strptime(data['time']['creation'],'%a, %d %b %Y %H:%M:%S +0000')
            except:
                self.stdout.write('Problem with datetime parsing %s' % data['time']['creation'])
            mo.avm_code = data['avm']['code']
            mo.save()
            self.stdout.write('Saved %s\n' % names[0])