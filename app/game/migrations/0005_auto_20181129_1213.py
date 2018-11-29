# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0004_auto_20181129_1211'),
    ]

    operations = [
        migrations.AlterField(
            model_name='telescope',
            name='aperture',
            field=models.CharField(max_length=3, choices=[(b'1m0', b'1-meter'), (b'2m0', b'2-meter'), (b'0m4', b'0.4-meter'), (b'0m8', b'0.8-meter')]),
        ),
    ]
