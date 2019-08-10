from behave import *

from admin.models import Client, Course, Application
from .. import fixtures


@given("the database with some clients, applications and courses")
def step_impl(context):
    clients = fixtures.clients()
    courses = fixtures.courses()
    fixtures.applications(courses, clients)
    assert Client.objects.count() > 0
    assert Course.objects.count() > 0
    assert Application.objects.count() > 0
