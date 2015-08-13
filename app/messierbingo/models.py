from django.db import models
from django.utils.timezone import now

APERTURES = (('1m0', '1-meter'), ('2m0', '2-meter'), ('04m', '0.4-meter'), ('any', 'Any'))

class Telescope(models.Model):
    name = models.CharField(max_length=30, unique=True)
    code = models.CharField(max_length=4, blank=True, null=True)
    site = models.CharField(max_length=3, blank=True, null=True)
    aperture = models.CharField(max_length=3, blank=True, null=True, choices=APERTURES)

    class Meta:
        ordering = ['site','name']

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
    image=models.URLField(max_length=100,blank=True, null=True)
    image_thumb=models.URLField(max_length=100,blank=True, null=True)
    telescope=models.ForeignKey(Telescope,blank=True, null=True)

    class Meta:
        ordering = ['name',]

    def __unicode__(self):
        return self.name

class Proposal(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)
    active = models.BooleanField(default=False)

    class Meta:
        ordering = ['code']

    def __unicode__(self):
        return self.code


