from django.db import models


class Group(models.Model):
    name = models.TextField(blank=True)


class AttendanceState(models.Model):
    name = models.TextField()


class Client(models.Model):
    name = models.TextField()
    surname = models.TextField()
    phone = models.TextField(null=True)
    email = models.TextField(null=True)
    note = models.TextField(blank=True, null=True)


class Course(models.Model):
    name = models.TextField()


class Lecture(models.Model):
    start = models.DateTimeField(blank=True, null=True)
    duration = models.PositiveIntegerField(blank=True, null=True)
    course = models.ForeignKey(Course, models.DO_NOTHING)
    group = models.ForeignKey(Group, models.DO_NOTHING, blank=True, null=True)


class Attendance(models.Model):
    paid = models.TextField()
    client = models.ForeignKey(Client, models.DO_NOTHING)
    lecture = models.ForeignKey(Lecture, models.DO_NOTHING)
    attendancestate = models.ForeignKey(AttendanceState, models.DO_NOTHING)


class MemberOf(models.Model):
    start = models.DateTimeField()
    end = models.DateTimeField(blank=True, null=True)
    client = models.ForeignKey(Client, models.DO_NOTHING)
    group = models.ForeignKey(Group, models.DO_NOTHING)