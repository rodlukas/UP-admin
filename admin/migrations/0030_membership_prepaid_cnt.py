# Generated by Django 2.1 on 2018-08-22 06:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin', '0029_attendancestate_excused'),
    ]

    operations = [
        migrations.AddField(
            model_name='membership',
            name='prepaid_cnt',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
