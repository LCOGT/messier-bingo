from django.db import models
from django.utils.timezone import now

APERTURES = (('1m0', '1-meter'), ('2m0', '2-meter'), ('0m4', '0.4-meter'), ('0m8', '0.8-meter'))

class Telescope(models.Model):
    name = models.CharField(max_length=30, unique=True)
    site = models.CharField(max_length=3)
    aperture = models.CharField(max_length=3, choices=APERTURES)

    class Meta:
        ordering = ['site','name']
        db_table = 'messierbingo_telescope'

    def __unicode__(self):
        return self.name

class MessierObject(models.Model):
    name = models.CharField(max_length=4, unique=True)
    othernames = models.CharField(max_length=255,blank=True, null=True)
    ra = models.FloatField(blank=True, null=True)
    dec = models.FloatField(blank=True, null=True)
    avm_code = models.CharField(max_length=10, blank=True, null=True)
    observer_name = models.CharField(max_length=40,blank=True, null=True)
    obs_date = models.DateTimeField(default=now)
    image=models.CharField(max_length=100,blank=True, null=True)
    telescope=models.ForeignKey(Telescope,blank=True, null=True)
    enabled=models.BooleanField(default=True)
    class Meta:
        ordering = ['name',]
        db_table = 'messierbingo_messierobject'

    def __unicode__(self):
        return self.name

class Proposal(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)
    active = models.BooleanField(default=False)

    class Meta:
        ordering = ['code']
        db_table = 'messierbingo_proposal'

    def __unicode__(self):
        return self.code
