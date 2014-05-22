from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from messierbingo.views import create_pdf
import os

class Command(BaseCommand):
    args = '<number>'
    help = 'Create bingo cards with random images on them, first removing all existing files'
    
    def handle(self, *args, **options):
        no_cards = int(args[0])
        # remove all existing cards
        folder = os.path.join(settings.MEDIA_ROOT,'cards')
        for the_file in os.listdir(folder):
            file_path = os.path.join(folder, the_file)
            try:
            	os.unlink(file_path)
            except Exception, e:
                self.stdout.write(e)
        self.stdout.write('Removed all existing cards\n')
        for n in range(0,no_cards):
            cardname = create_pdf(n)
            if cardname:
                self.stdout.write('Created card %s of %s\n' % (n+1,no_cards))
            else:
                self.stdout.write('Card creation failed')