from behave import *
from admin.models import AttendanceState
from .. import fixtures


@given('the database with some attendance states')
def step_impl(context):
    fixtures.attendancestates()
    assert AttendanceState.objects.count() > 0
