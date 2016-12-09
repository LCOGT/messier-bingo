# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('messierbingo', '0007_telescope_aperture'),
    ]

    operations = [
        migrations.AddField(
            model_name='messierobject',
            name='enabled',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='telescope',
            name='aperture',
            field=models.CharField(blank=True, max_length=3, null=True, choices=[(b'1m0', b'1-meter'), (b'2m0', b'2-meter'), (b'0m4', b'0.4-meter'), (b'any', b'Any')]),
        ),
        migrations.AlterModelTable(
            name='messierobject',
            table='messierbingo_messierobject',
        ),
        migrations.AlterModelTable(
            name='proposal',
            table='messierbingo_proposal',
        ),
        migrations.AlterModelTable(
            name='telescope',
            table='messierbingo_telescope',
        ),
    ]
