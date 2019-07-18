from behave import *

from admin.models import Client, Group, AttendanceState, Course, Lecture
from .. import fixtures


@given('the database with some clients, groups, courses and attendance states')
def step_impl(context):
    clients = fixtures.clients()
    courses = fixtures.courses()
    attendancestates = fixtures.attendancestates()
    groups = fixtures.groups(courses, clients)
    fixtures.lectures(courses, clients, groups, attendancestates)
    assert Client.objects.count() > 0
    assert Course.objects.count() > 0
    assert Group.objects.count() > 0
    assert AttendanceState.objects.count() > 0
    assert Lecture.objects.count() > 0
