# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('messierbingo', '0006_proposal'),
    ]

    operations = [
        migrations.AddField(
            model_name='telescope',
            name='aperture',
            field=models.CharField(blank=True, max_length=3, null=True, choices=[(b'1m0', b'1-meter'), (b'2m0', b'2-meter'), (b'04m', b'0.4-meter'), (b'any', b'Any')]),
        ),
    ]
