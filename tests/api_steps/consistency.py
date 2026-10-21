import json

from behave import when, then
from rest_framework import status

from tests.api_steps import helpers

# noinspection PyUnresolvedReferences
from tests.common_steps import lectures


@when(
    'user adds a group lecture and then removes "{removed_client}" from "{group_name}" with refresh'
)
def step_impl(context, removed_client, group_name):
    group = helpers.find_group_with_name(context.api_client, group_name)
    assert group
    attendancestate = helpers.find_attendancestate_with_name(context.api_client, "OK")
    # pridej lekci s ucasti vsech soucasnych clenu skupiny
    attendances = [
        {
            "client_id": membership["client"]["id"],
            "attendancestate": attendancestate["id"],
            "paid": True,
            "note": "",
        }
        for membership in group["memberships"]
    ]
    lecture_resp = context.api_client.post(
        helpers.API_LECTURES,
        {
            "group_id": group["id"],
            "duration": 40,
            "canceled": False,
            "start": "2018-06-01T10:00:00",
            "attendances": attendances,
        },
    )
    assert lecture_resp.status_code == status.HTTP_201_CREATED
    lecture = json.loads(lecture_resp.content)
    context.lecture_id = lecture["id"]

    # odeber klienta z clenstvi skupiny
    removed_client_parsed = helpers.parse_client_full_name(removed_client)
    remaining_memberships = [
        {"client_id": membership["client"]["id"]}
        for membership in group["memberships"]
        if not helpers.client_full_names_equal(membership["client"], removed_client_parsed)
    ]
    group_resp = context.api_client.put(
        f"{helpers.API_GROUPS}{group['id']}/",
        {
            "name": group["name"],
            "course_id": group["course"]["id"],
            "active": group["active"],
            "memberships": remaining_memberships,
        },
    )
    assert group_resp.status_code == status.HTTP_200_OK

    # projev zmenu clenu skupiny na jiz existujici lekci (bez noveho prihlaseni odebraneho klienta)
    refresh_resp = context.api_client.put(
        f"{helpers.API_LECTURES}{lecture['id']}/",
        {
            "group_id": group["id"],
            "duration": lecture["duration"],
            "canceled": lecture["canceled"],
            "start": lecture["start"],
            "refresh_clients": True,
            "attendances": [
                {
                    "id": attendance["id"],
                    "client_id": attendance["client"]["id"],
                    "attendancestate": attendance["attendancestate"],
                    "paid": attendance["paid"],
                    "note": attendance["note"],
                }
                for attendance in lecture["attendances"]
            ],
        },
    )
    assert refresh_resp.status_code == status.HTTP_200_OK


@then('the lecture no longer has attendance of "{removed_client}"')
def step_impl(context, removed_client):
    lecture_resp = context.api_client.get(f"{helpers.API_LECTURES}{context.lecture_id}/")
    assert lecture_resp.status_code == status.HTTP_200_OK
    lecture = json.loads(lecture_resp.content)
    parsed = helpers.parse_client_full_name(removed_client)
    assert not any(
        helpers.client_full_names_equal(attendance["client"], parsed)
        for attendance in lecture["attendances"]
    )


@when('user tries to delete the client "{full_name}" through the API')
def step_impl(context, full_name):
    client = helpers.find_client_with_full_name(context.api_client, full_name)
    assert client
    context.resp = context.api_client.delete(f"{helpers.API_CLIENTS}{client['id']}/")


@then("the API refuses because the client has lectures")
def step_impl(context):
    assert context.resp.status_code == status.HTTP_403_FORBIDDEN
    detail = json.loads(context.resp.content)["detail"]
    assert "lekce" in detail


@when("user requests a client that does not exist")
def step_impl(context):
    context.resp = context.api_client.get(f"{helpers.API_CLIENTS}999999/")


@then("the API answers not found")
def step_impl(context):
    assert context.resp.status_code == status.HTTP_404_NOT_FOUND
