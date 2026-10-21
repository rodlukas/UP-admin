from behave import when, then
from rest_framework import status

from tests.api_steps import helpers

# noinspection PyUnresolvedReferences
from tests.common_steps import lectures


def prepaid_lecture_dict(api_client, client, course, paid):
    attendancestate = helpers.find_attendancestate_with_name(api_client, "OK")
    return {
        "course_id": course["id"],
        "duration": course["duration"],
        "canceled": False,
        "start": None,
        "attendances": [
            {
                "client_id": client["id"],
                "attendancestate": attendancestate["id"],
                "paid": paid,
                "note": "",
            }
        ],
    }


def find_membership(api_client, group_name, client_full_name):
    group = helpers.find_group_with_name(api_client, group_name)
    assert group
    client_parsed = helpers.parse_client_full_name(client_full_name)
    for membership in group["memberships"]:
        if helpers.client_full_names_equal(membership["client"], client_parsed):
            return membership
    return None


@when('user creates {count:d} prepaid lectures for "{full_name}" in course "{course_name}"')
def step_impl(context, count, full_name, course_name):
    client = helpers.find_client_with_full_name(context.api_client, full_name)
    course = helpers.find_course_with_name(context.api_client, course_name)
    context.client_id = client["id"]
    context.course_id = course["id"]
    payload = [prepaid_lecture_dict(context.api_client, client, course, True) for _ in range(count)]
    context.resp = context.api_client.post(helpers.API_LECTURES, payload)
    context.created_count = count


@then("the prepaid lectures are stored")
def step_impl(context):
    assert context.resp.status_code == status.HTTP_201_CREATED
    created = context.resp.json()
    assert len(created) == context.created_count
    assert all(lecture["start"] is None for lecture in created)
    all_lectures = helpers.get_lectures(context.api_client)
    prepaid_for_client = [
        lecture
        for lecture in all_lectures
        if lecture["start"] is None
        and lecture["course"]["id"] == context.course_id
        and any(
            attendance["client"]["id"] == context.client_id for attendance in lecture["attendances"]
        )
    ]
    assert len(prepaid_for_client) == context.created_count


@when('user creates an unpaid prepaid lecture for "{full_name}" in course "{course_name}"')
def step_impl(context, full_name, course_name):
    client = helpers.find_client_with_full_name(context.api_client, full_name)
    course = helpers.find_course_with_name(context.api_client, course_name)
    payload = prepaid_lecture_dict(context.api_client, client, course, False)
    context.resp = context.api_client.post(helpers.API_LECTURES, payload)


@then("the prepaid lecture is rejected")
def step_impl(context):
    assert context.resp.status_code == status.HTTP_400_BAD_REQUEST


@when('user sets the prepaid counter of "{full_name}" in group "{group_name}" to {count:d}')
def step_impl(context, full_name, group_name, count):
    membership = find_membership(context.api_client, group_name, full_name)
    assert membership
    context.membership_id = membership["id"]
    context.group_name = group_name
    context.client_full_name = full_name
    context.resp = context.api_client.patch(
        f"{helpers.API_MEMBERSHIPS}{membership['id']}/", {"prepaid_cnt": count}
    )


@then('the prepaid counter of "{full_name}" in group "{group_name}" is {count:d}')
def step_impl(context, full_name, group_name, count):
    assert context.resp.status_code == status.HTTP_200_OK
    membership = find_membership(context.api_client, group_name, full_name)
    assert membership["prepaid_cnt"] == count
