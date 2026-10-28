import json

from behave import when, then
from rest_framework import status

from tests import common_helpers
from tests.api_steps import helpers

# noinspection PyUnresolvedReferences
from tests.common_steps import lectures


@when(
    'user adds a group lecture and then removes "{removed_client}" from "{group_name}" with refresh'
)
def step_impl(context, removed_client, group_name):
    group = helpers.find_group_with_name(context.api_client, group_name)
    assert group
    lecture_resp = helpers.add_group_lecture(context.api_client, group, "2018-06-01T10:00:00")
    assert lecture_resp.status_code == status.HTTP_201_CREATED
    lecture = json.loads(lecture_resp.content)
    context.lecture_id = lecture["id"]

    # odeber klienta z clenstvi skupiny
    removed_client_parsed = helpers.parse_client_full_name(removed_client)
    remaining_memberships = [
        membership
        for membership in group["memberships"]
        if not helpers.client_full_names_equal(membership["client"], removed_client_parsed)
    ]
    context.remaining_clients = [
        common_helpers.client_full_name(m["client"]["firstname"], m["client"]["surname"])
        for m in remaining_memberships
    ]
    group_resp = context.api_client.put(
        f"{helpers.API_GROUPS}{group['id']}/",
        {
            "name": group["name"],
            "course_id": group["course"]["id"],
            "active": group["active"],
            "memberships": [{"client_id": m["client"]["id"]} for m in remaining_memberships],
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
    attendances = json.loads(lecture_resp.content)["attendances"]
    assert helpers.find_by_client_full_name(attendances, removed_client) is None
    # ucast zbylych clenu musi zustat - jinak by prosla i obnova, ktera smaze vsechny ucasti
    for remaining_client in context.remaining_clients:
        assert helpers.find_by_client_full_name(attendances, remaining_client) is not None


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
