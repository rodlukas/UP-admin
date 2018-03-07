from django.db import models


class Group(models.Model):
    name = models.TextField(blank=True)


class AttendanceState(models.Model):
    name = models.TextField()


class Client(models.Model):
    name = models.TextField()
    surname = models.TextField()
    phone = models.TextField(blank=True)
    email = models.TextField(blank=True)
    note = models.TextField(blank=True)


class Course(models.Model):
    name = models.TextField()


class Lecture(models.Model):
    start = models.DateTimeField(blank=True, null=True)
    duration = models.PositiveIntegerField(blank=True, null=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, related_name='lectures', on_delete=models.CASCADE, blank=True, null=True)


class Attendance(models.Model):
    paid = models.BooleanField()
    note = models.TextField(blank=True)
    client = models.ForeignKey(Client, related_name='attendances', on_delete=models.CASCADE)
    lecture = models.ForeignKey(Lecture, related_name='attendances', on_delete=models.CASCADE)
    attendancestate = models.ForeignKey(AttendanceState, on_delete=models.CASCADE)


class Membership(models.Model):
    start = models.DateTimeField()
    end = models.DateTimeField(blank=True, null=True)
    client = models.ForeignKey(Client, related_name='memberships', on_delete=models.CASCADE)
    group = models.ForeignKey(Group, related_name='memberships', on_delete=models.CASCADE)
