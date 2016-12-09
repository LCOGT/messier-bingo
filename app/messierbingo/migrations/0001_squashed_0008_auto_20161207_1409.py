# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    replaces = [(b'messierbingo', '0001_initial'), (b'messierbingo', '0002_auto_20150730_1150'), (b'messierbingo', '0003_auto_20150730_1355'), (b'messierbingo', '0004_auto_20150730_1357'), (b'messierbingo', '0005_auto_20150730_1413'), (b'messierbingo', '0006_proposal'), (b'messierbingo', '0007_telescope_aperture'), (b'messierbingo', '0008_auto_20161207_1409')]

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Object',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(unique=True, max_length=4)),
                ('othernames', models.CharField(max_length=255, null=True, blank=True)),
                ('ra', models.FloatField()),
                ('dec', models.FloatField()),
                ('avm_code', models.CharField(max_length=10, null=True, blank=True)),
                ('observer_name', models.CharField(max_length=30)),
                ('obs_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('image', models.CharField(max_length=100)),
                ('image_thumb', models.CharField(max_length=100)),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Telescope',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(unique=True, max_length=30)),
                ('code', models.CharField(max_length=4, null=True, blank=True)),
                ('site', models.CharField(max_length=3, null=True, blank=True)),
                ('aperture', models.CharField(blank=True, max_length=3, null=True, choices=[(b'1m0', b'1-meter'), (b'2m0', b'2-meter'), (b'0m4', b'0.4-meter'), (b'any', b'Any')])),
            ],
            options={
                'ordering': ['site', 'name'],
            },
        ),
        migrations.AddField(
            model_name='object',
            name='telescope',
            field=models.ForeignKey(to='messierbingo.Telescope'),
        ),
        migrations.RenameModel(
            old_name='Object',
            new_name='MessierObject',
        ),
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
        migrations.AlterField(
            model_name='messierobject',
            name='observer_name',
            field=models.CharField(max_length=40, null=True, blank=True),
        ),
        migrations.CreateModel(
            name='Proposal',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=100)),
                ('code', models.CharField(max_length=20)),
                ('active', models.BooleanField(default=False)),
            ],
            options={
                'ordering': ['code'],
            },
        ),
        migrations.AddField(
            model_name='messierobject',
            name='enabled',
            field=models.BooleanField(default=True),
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
