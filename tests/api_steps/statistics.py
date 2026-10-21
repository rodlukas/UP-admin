from behave import given, when, then
from rest_framework import status

from tests.api_steps import helpers

# noinspection PyUnresolvedReferences
from tests.common_steps import lectures


@given('a lecture of "{full_name}" in course "{course_name}" at "{date}", "{time}"')
def step_impl(context, full_name, course_name, date, time):
    client = helpers.find_client_with_full_name(context.api_client, full_name)
    course = helpers.find_course_with_name(context.api_client, course_name)
    attendancestate = helpers.find_attendancestate_with_name(context.api_client, "OK")
    resp = context.api_client.post(
        helpers.API_LECTURES,
        {
            "course_id": course["id"],
            "duration": course["duration"],
            "canceled": False,
            "start": f"{date}T{time}:00",
            "attendances": [
                {
                    "client_id": client["id"],
                    "attendancestate": attendancestate["id"],
                    "paid": True,
                    "note": "",
                }
            ],
        },
    )
    assert resp.status_code == status.HTTP_201_CREATED


@when("user requests statistics")
def step_impl(context):
    context.resp = context.api_client.get(helpers.API_STATS)


@when('user requests statistics for year "{year}"')
def step_impl(context, year):
    context.resp = context.api_client.get(helpers.API_STATS, {"year": year})


@then(
    "the statistics show {clients:d} clients ({active_clients:d} active)"
    " and {groups:d} groups ({active_groups:d} active)"
)
def step_impl(context, clients, active_clients, groups, active_groups):
    assert context.resp.status_code == status.HTTP_200_OK
    stats = context.resp.json()
    assert stats["clients"]["total"] == clients
    assert stats["clients"]["active"] == active_clients
    assert stats["groups"]["total"] == groups
    assert stats["groups"]["active"] == active_groups


@then("the statistics show {count:d} lectures")
def step_impl(context, count):
    assert context.resp.status_code == status.HTTP_200_OK
    assert context.resp.json()["lectures"]["total"] == count
