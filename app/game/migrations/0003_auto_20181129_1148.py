# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0002_messierobject_enabled'),
    ]

    operations = [
        migrations.AlterField(
            model_name='messierobject',
            name='image',
            field=models.CharField(max_length=100, null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='messierobject',
            name='image_thumb',
            field=models.CharField(max_length=100, null=True, blank=True),
        ),
    ]
