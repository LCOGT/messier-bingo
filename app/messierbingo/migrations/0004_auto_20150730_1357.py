# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('messierbingo', '0003_auto_20150730_1355'),
    ]

    operations = [
        migrations.AlterField(
            model_name='messierobject',
            name='observer_name',
            field=models.CharField(max_length=40, null=True, blank=True),
        ),
    ]
