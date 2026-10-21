from behave import when, then
from rest_framework import status

from tests import common_helpers
from tests.api_steps import helpers

# noinspection PyUnresolvedReferences
from tests.common_steps import lectures


def assert_remind_pay(context, expected):
    lecture_resp = context.api_client.get(f"{helpers.API_LECTURES}{context.lecture_id}/")
    assert lecture_resp.status_code == status.HTTP_200_OK
    lecture = lecture_resp.json()
    attendance = helpers.find_by_client_full_name(lecture["attendances"], context.attendance_client)
    assert attendance is not None
    assert attendance["remind_pay"] is expected, f"remind_pay: {attendance['remind_pay']}"


@when('user fetches the attendance of "{full_name}" at "{date}", "{time}"')
def step_impl(context, full_name, date, time):
    start = common_helpers.prepare_start(date, time)
    lecture = helpers.find_lecture_with_start(context.api_client, start)
    assert lecture
    context.lecture_id = lecture["id"]
    context.attendance_client = full_name


@when('user adds a paid group lecture for "{group_name}"')
def step_impl(context, group_name):
    group = helpers.find_group_with_name(context.api_client, group_name)
    assert group
    resp = helpers.add_group_lecture(context.api_client, group, "2018-06-02T10:00:00")
    assert resp.status_code == status.HTTP_201_CREATED
    context.lecture_id = resp.json()["id"]


@then("the attendance needs a payment reminder")
def step_impl(context):
    assert_remind_pay(context, True)


@then("the attendance does not need a payment reminder")
def step_impl(context):
    assert_remind_pay(context, False)


@then('the attendance of "{full_name}" in that lecture needs a payment reminder')
def step_impl(context, full_name):
    context.attendance_client = full_name
    assert_remind_pay(context, True)


@then('the attendance of "{full_name}" in that lecture does not need a payment reminder')
def step_impl(context, full_name):
    context.attendance_client = full_name
    assert_remind_pay(context, False)
