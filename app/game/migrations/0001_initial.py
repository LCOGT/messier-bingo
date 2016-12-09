# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MessierObject',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(unique=True, max_length=4)),
                ('othernames', models.CharField(max_length=255, null=True, blank=True)),
                ('ra', models.FloatField(null=True, blank=True)),
                ('dec', models.FloatField(null=True, blank=True)),
                ('avm_code', models.CharField(max_length=10, null=True, blank=True)),
                ('observer_name', models.CharField(max_length=40, null=True, blank=True)),
                ('obs_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('image', models.URLField(max_length=100, null=True, blank=True)),
                ('image_thumb', models.URLField(max_length=100, null=True, blank=True)),
            ],
            options={
                'ordering': ['name'],
                'db_table': 'messierbingo_messierobject',
            },
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
                'db_table': 'messierbingo_proposal',
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
                'db_table': 'messierbingo_telescope',
            },
        ),
        migrations.AddField(
            model_name='messierobject',
            name='telescope',
            field=models.ForeignKey(blank=True, to='game.Telescope', null=True),
        ),
    ]
