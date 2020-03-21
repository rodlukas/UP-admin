from behave import given

from admin.models import Course
from .. import fixtures


@given("the database with some courses")
def step_impl(context):
    fixtures.courses()
    assert Course.objects.count() > 0
