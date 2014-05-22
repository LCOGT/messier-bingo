from django.db import models

class Object(models.Model):
	name = models.CharField(max_length=64,blank=True, null=True)
	othernames = models.CharField(max_length=255,blank=True, null=True)
	object_id = models.IntegerField()
	ra = models.FloatField()
	dec = models.FloatField()
	image = models.FileField(upload_to="object/")