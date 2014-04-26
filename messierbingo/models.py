from django.db import models

class Object(models.Model):
	name = models.CharField(max_length=64)
	othernames = models.CharField(max_length=255)
	object_id = models.IntegerField()
	ra = models.FloatField()
	dec = models.FloatField()