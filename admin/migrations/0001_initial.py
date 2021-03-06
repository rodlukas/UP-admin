# Generated by Django 2.0.2 on 2018-02-27 09:48

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Attendance",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("paid", models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name="AttendanceState",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("name", models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name="Client",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("name", models.TextField()),
                ("surname", models.TextField()),
                ("phone", models.TextField(blank=True)),
                ("email", models.TextField(blank=True)),
                ("note", models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name="Course",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("name", models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name="Group",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("name", models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name="Lecture",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("start", models.DateTimeField(blank=True, null=True)),
                ("duration", models.PositiveSmallIntegerField(blank=True, null=True)),
                (
                    "courseid",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING, to="admin.Course"
                    ),
                ),
                (
                    "groupid",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        to="admin.Group",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="MemberOf",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("start", models.DateTimeField()),
                ("end", models.DateTimeField(blank=True, null=True)),
                (
                    "clientid",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING, to="admin.Client"
                    ),
                ),
                (
                    "groupid",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING, to="admin.Group"
                    ),
                ),
            ],
        ),
        migrations.AddField(
            model_name="attendance",
            name="attendancestateid",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING, to="admin.AttendanceState"
            ),
        ),
        migrations.AddField(
            model_name="attendance",
            name="clientid",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING, to="admin.Client"
            ),
        ),
        migrations.AddField(
            model_name="attendance",
            name="lectureid",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING, to="admin.Lecture"
            ),
        ),
    ]
