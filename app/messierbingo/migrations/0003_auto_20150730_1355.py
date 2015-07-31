# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('messierbingo', '0002_auto_20150730_1150'),
    ]

    operations = [
        migrations.AlterField(
            model_name='messierobject',
            name='dec',
            field=models.FloatField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='messierobject',
            name='image',
            field=models.URLField(max_length=100, null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='messierobject',
            name='image_thumb',
            field=models.URLField(max_length=100, null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='messierobject',
            name='observer_name',
            field=models.CharField(max_length=30, null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='messierobject',
            name='ra',
            field=models.FloatField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='messierobject',
            name='telescope',
            field=models.ForeignKey(blank=True, to='messierbingo.Telescope', null=True),
        ),
    ]
