# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('messierbingo', '0004_auto_20150730_1357'),
    ]

    operations = [
        migrations.AlterField(
            model_name='telescope',
            name='code',
            field=models.CharField(max_length=4, null=True, blank=True),
        ),
    ]
