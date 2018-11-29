# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0003_auto_20181129_1148'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='messierobject',
            name='image_thumb',
        ),
        migrations.RemoveField(
            model_name='telescope',
            name='code',
        ),
        migrations.AlterField(
            model_name='telescope',
            name='aperture',
            field=models.CharField(default='2m0', max_length=3, choices=[(b'1m0', b'1-meter'), (b'2m0', b'2-meter'), (b'0m4', b'0.4-meter'), (b'any', b'Any')]),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='telescope',
            name='site',
            field=models.CharField(default='ogg', max_length=3),
            preserve_default=False,
        ),
    ]
