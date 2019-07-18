from behave import *

from admin.models import Client, Course, Group
from .. import fixtures


@given('the database with some clients, groups and courses')
def step_impl(context):
    clients = fixtures.clients()
    courses = fixtures.courses()
    fixtures.groups(courses, clients)
    assert Client.objects.count() > 0
    assert Course.objects.count() > 0
    assert Group.objects.count() > 0
