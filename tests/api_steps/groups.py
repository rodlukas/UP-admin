import json

from behave import *
from rest_framework import status

from tests import common_helpers
from tests.api_steps import helpers
from tests.api_steps import login_logout
from tests.common_steps import groups


def groups_cnt(api_client):
    return len(helpers.get_groups(api_client))


def parse_memberships(memberships_data):
    return [common_helpers.client_full_name(membership['client']['name'], membership['client']['surname']) for
            membership in memberships_data]


def find_group(context):
    all_groups = helpers.get_groups(context.api_client)
    # najdi skupinu s udaji v kontextu
    for group in all_groups:
        if group_equal_to_context(group, context):
            return True
    return False


def group_equal_to_context(group, context):
    # POZOR - data v kontextu nemusi obsahovat dane klice
    memberships = parse_memberships(group['memberships'])
    return (group['name'] == context.name and
            group['course']['name'] == context.course.get('name') and
            set(memberships) == set(context.memberships) and
            group['active'] == context.active)


def find_group_with_id(context, group_id):
    # nacti skupinu z endpointu podle id
    group_resp = context.api_client.get(f"{helpers.API_GROUPS}{group_id}/")
    assert group_resp.status_code == status.HTTP_200_OK
    group = json.loads(group_resp.content)
    # porovnej ziskana data se zaslanymi udaji
    assert group_equal_to_context(group, context)


def group_dict(context):
    memberships = [{'client_id': helpers.find_client_with_full_name(context.api_client, membership).get('id')}
                   for membership in context.memberships]
    return {'name': context.name,
            'course_id': context.course.get('id'),
            'memberships': memberships,
            'active': context.active}


def load_data_to_context(context, name, course, active, *memberships):
    load_id_data_to_context(context, name)
    context.course = helpers.find_course_with_name(context.api_client, course)
    # z memberships vyfiltruj prazdne stringy
    context.memberships = common_helpers.filter_empty_strings_from_list(memberships)
    context.active = common_helpers.to_bool(active)


def load_id_data_to_context(context, name):
    context.name = name


def save_old_groups_cnt_to_context(context):
    context.old_groups_cnt = groups_cnt(context.api_client)


@then('the group is added')
def step_impl(context):
    # vlozeni bylo uspesne
    assert context.resp.status_code == status.HTTP_201_CREATED
    # nacti udaje vlozene skupiny
    group_id = json.loads(context.resp.content)['id']
    # podle ID skupiny over, ze souhlasi jeji data
    find_group_with_id(context, group_id)
    # najdi skupinu ve vsech skupinach podle dat
    assert find_group(context)
    assert groups_cnt(context.api_client) > context.old_groups_cnt


@then('the group is updated')
def step_impl(context):
    # uprava byla uspesna
    assert context.resp.status_code == status.HTTP_200_OK
    # nacti udaje upravovane skupiny
    group_id = json.loads(context.resp.content)['id']
    # podle ID skupiny over, ze souhlasi jeji data
    find_group_with_id(context, group_id)
    # najdi skupinu ve vsech skupinach podle dat
    assert find_group(context)
    assert groups_cnt(context.api_client) == context.old_groups_cnt


@then('the group is deleted')
def step_impl(context):
    # smazani bylo uspesne
    assert context.resp.status_code == status.HTTP_204_NO_CONTENT
    assert not helpers.find_group_with_name(context.api_client, context.name)
    assert groups_cnt(context.api_client) < context.old_groups_cnt


@when('user deletes the group "{name}"')
def step_impl(context, name):
    # nacti jmeno skupiny do kontextu
    load_id_data_to_context(context, name)
    # najdi skupinu
    group_to_delete = helpers.find_group_with_name(context.api_client, context.name)
    assert group_to_delete
    # uloz puvodni pocet skupin
    save_old_groups_cnt_to_context(context)
    # smazani skupiny
    context.resp = context.api_client.delete(f"{helpers.API_GROUPS}{group_to_delete['id']}/")


@then('the group is not added')
def step_impl(context):
    # vlozeni bylo neuspesne
    assert context.resp.status_code == status.HTTP_400_BAD_REQUEST
    # over, ze v odpovedi skutecne neni id skupiny
    group = json.loads(context.resp.content)
    assert 'id' not in group
    assert not find_group(context)
    assert groups_cnt(context.api_client) == context.old_groups_cnt


@when(
    'user updates the data of group "{cur_name}" to name "{new_name}", course "{new_course}", activity "{new_active}" and clients to "{new_member_full_name1}", "{new_member_full_name2}" and "{new_member_full_name3}"')
def step_impl(context, cur_name, new_name, new_course, new_active, new_member_full_name1, new_member_full_name2,
              new_member_full_name3):
    # nacteni dat skupiny do kontextu
    load_data_to_context(context, new_name, new_course, new_active, new_member_full_name1, new_member_full_name2,
                         new_member_full_name3)
    # najdi skupinu
    group_to_update = helpers.find_group_with_name(context.api_client, cur_name)
    assert group_to_update
    # uloz puvodni pocet skupin
    save_old_groups_cnt_to_context(context)
    # vlozeni skupiny
    context.resp = context.api_client.put(f"{helpers.API_GROUPS}{group_to_update['id']}/", group_dict(context))


use_step_matcher("re")


@when(
    'user adds new group "(?P<name>.*)" for course "(?P<course>.*)" with activity "(?P<active>.*)" and clients "(?P<member_full_name1>.*)" and "(?P<member_full_name2>.*)"')
def step_impl(context, name, course, active, member_full_name1, member_full_name2):
    # nacteni dat skupiny do kontextu
    load_data_to_context(context, name, course, active, member_full_name1, member_full_name2)
    # uloz puvodni pocet skupin
    save_old_groups_cnt_to_context(context)
    # vlozeni skupiny
    context.resp = context.api_client.post(helpers.API_GROUPS, group_dict(context))
