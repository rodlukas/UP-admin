import json

from behave import when, then, use_step_matcher
from rest_framework import status

from tests import common_helpers

# noinspection PyUnresolvedReferences
from tests.api_steps import helpers, login_logout

# noinspection PyUnresolvedReferences
from tests.common_steps import attendancestates


def attendancestates_cnt(api_client):
    return len(helpers.get_attendancestates(api_client))


def find_attendancestate(context):
    all_attendancestates = helpers.get_attendancestates(context.api_client)
    # najdi stav ucasti s udaji v kontextu
    for attendancestate in all_attendancestates:
        if attendancestate_equal_to_context(attendancestate, context):
            return True
    return False


def attendancestate_equal_to_context(attendancestate, context):
    return attendancestate["name"] == context.name and attendancestate["visible"] == context.visible


def find_attendancestate_with_id(context, attendancestate_id):
    # nacti stav ucasti z endpointu podle id
    attendancestate_resp = context.api_client.get(
        f"{helpers.API_ATTENDANCESTATES}{attendancestate_id}/"
    )
    assert attendancestate_resp.status_code == status.HTTP_200_OK
    attendancestate = json.loads(attendancestate_resp.content)
    # porovnej ziskana data se zaslanymi udaji
    assert attendancestate_equal_to_context(attendancestate, context)


def attendancestate_dict(context):
    return {"name": context.name, "visible": context.visible}


def load_data_to_context(context, name, visible):
    load_id_data_to_context(context, name)
    context.visible = common_helpers.to_bool(visible)


def load_id_data_to_context(context, name):
    context.name = name


def save_old_attendancestates_cnt_to_context(context):
    context.old_attendancestates_cnt = attendancestates_cnt(context.api_client)


@then("the attendance state is added")
def step_impl(context):
    # vlozeni bylo uspesne
    assert context.resp.status_code == status.HTTP_201_CREATED
    # nacti udaje vlozene stavu ucasti
    attendancestate_id = json.loads(context.resp.content)["id"]
    # podle ID stavu ucasti over, ze souhlasi jeji data
    find_attendancestate_with_id(context, attendancestate_id)
    # najdi stav ucasti ve vsech stavech ucasti podle dat
    assert find_attendancestate(context)
    assert attendancestates_cnt(context.api_client) > context.old_attendancestates_cnt


@then("the attendance state is updated")
def step_impl(context):
    # uprava byla uspesna
    assert context.resp.status_code == status.HTTP_200_OK
    # nacti udaje upravovane stavu ucasti
    attendancestate_id = json.loads(context.resp.content)["id"]
    # podle ID stavu ucasti over, ze souhlasi jeji data
    find_attendancestate_with_id(context, attendancestate_id)
    # najdi stav ucasti ve vsech stavech ucasti podle dat
    assert find_attendancestate(context)
    assert attendancestates_cnt(context.api_client) == context.old_attendancestates_cnt


@then("the attendance state is deleted")
def step_impl(context):
    # smazani bylo uspesne
    assert context.resp.status_code == status.HTTP_204_NO_CONTENT
    assert not helpers.find_attendancestate_with_name(context.api_client, context.name)
    assert attendancestates_cnt(context.api_client) < context.old_attendancestates_cnt


@when('user deletes the attendance state "{name}"')
def step_impl(context, name):
    # nacti jmeno stavu ucasti do kontextu
    load_id_data_to_context(context, name)
    # najdi stav ucasti
    attendancestate_to_delete = helpers.find_attendancestate_with_name(
        context.api_client, context.name
    )
    assert attendancestate_to_delete
    # uloz puvodni pocet stavu ucasti
    save_old_attendancestates_cnt_to_context(context)
    # smazani stavu ucasti
    context.resp = context.api_client.delete(
        f"{helpers.API_ATTENDANCESTATES}{attendancestate_to_delete['id']}/"
    )


@then("the attendance state is not added")
def step_impl(context):
    # vlozeni bylo neuspesne
    assert context.resp.status_code == status.HTTP_400_BAD_REQUEST
    # over, ze v odpovedi skutecne neni id stavu ucasti
    attendancestate = json.loads(context.resp.content)
    assert "id" not in attendancestate
    assert not find_attendancestate(context)
    assert attendancestates_cnt(context.api_client) == context.old_attendancestates_cnt


@when(
    'user updates the data of attendance state "{cur_name}" to name "{new_name}" and visibility "{new_visible}"'
)
def step_impl(context, cur_name, new_name, new_visible):
    # nacteni dat stavu ucasti do kontextu
    load_data_to_context(context, new_name, new_visible)
    # najdi stav ucasti
    attendancestate_to_update = helpers.find_attendancestate_with_name(context.api_client, cur_name)
    assert attendancestate_to_update
    # uloz puvodni pocet stavu ucasti
    save_old_attendancestates_cnt_to_context(context)
    # vlozeni stavu ucasti
    context.resp = context.api_client.put(
        f"{helpers.API_ATTENDANCESTATES}{attendancestate_to_update['id']}/",
        attendancestate_dict(context),
    )


use_step_matcher("re")


@when('user adds new attendance state "(?P<name>.*)" with visibility "(?P<visible>.*)"')
def step_impl(context, name, visible):
    # nacteni dat stavu ucasti do kontextu
    load_data_to_context(context, name, visible)
    # uloz puvodni pocet stavu ucasti
    save_old_attendancestates_cnt_to_context(context)
    # vlozeni stavu ucasti
    context.resp = context.api_client.post(
        helpers.API_ATTENDANCESTATES, attendancestate_dict(context)
    )
