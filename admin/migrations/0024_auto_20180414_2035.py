# Generated by Django 2.0.4 on 2018-04-14 18:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin', '0023_auto_20180414_1155'),
    ]

    operations = [
        migrations.AlterField(
            model_name='client',
            name='email',
            field=models.EmailField(blank=True, max_length=254),
        ),
    ]
