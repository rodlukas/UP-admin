# Generated by Django 3.0.5 on 2020-04-13 20:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("admin", "0047_auto_20200306_1527")]

    operations = [
        migrations.AlterField(
            model_name="course",
            name="color",
            field=models.CharField(default="#000000", help_text="Kód barvy kurzu", max_length=7),
        )
    ]