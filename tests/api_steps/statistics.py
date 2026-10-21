from behave import when, then
from rest_framework import status

from admin.models import Client, Group
from tests.api_steps import helpers

# noinspection PyUnresolvedReferences
from tests.common_steps import lectures


@when("user requests statistics")
def step_impl(context):
    context.resp = context.api_client.get(helpers.API_STATS)


@when('user requests statistics for year "{year}"')
def step_impl(context, year):
    context.resp = context.api_client.get(helpers.API_STATS, {"year": year})


@then("the statistics counts match the database")
def step_impl(context):
    assert context.resp.status_code == status.HTTP_200_OK
    stats = context.resp.json()
    assert stats["clients"]["total"] == Client.objects.count()
    assert stats["clients"]["active"] == Client.objects.filter(active=True).count()
    assert stats["groups"]["total"] == Group.objects.count()
    assert stats["groups"]["active"] == Group.objects.filter(active=True).count()


@then("the statistics show {count:d} lectures")
def step_impl(context, count):
    assert context.resp.status_code == status.HTTP_200_OK
    stats = context.resp.json()
    assert stats["lectures"]["total"] == count
