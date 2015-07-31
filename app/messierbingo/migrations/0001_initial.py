# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone


class Migration(migrations.Migration):

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
                ('code', models.CharField(max_length=3, null=True, blank=True)),
                ('site', models.CharField(max_length=3, null=True, blank=True)),
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
    ]
