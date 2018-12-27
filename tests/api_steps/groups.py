from behave import *
import json
from tests.api_steps import helpers
from tests import common_helpers
from rest_framework import status
from tests.common_steps import groups
from tests.api_steps import login_logout

API_ENDPOINT = helpers.api_url("/groups/")


def groups_cnt(api_client):
    return len(helpers.get_groups(api_client))


def parse_memberships(memberships_data):
    return [common_helpers.client_full_name(membership['client']['name'], membership['client']['surname']) for
            membership in memberships_data]


def find_group(context):
    all_groups = helpers.get_groups(context.api_client)
    # najdi skupinu s udaji v kontextu
    for group in all_groups:
        memberships = parse_memberships(group['memberships'])
        if (group['name'] == context.name and
                group['course']['name'] == context.course['name'] and
                set(memberships) == set(context.memberships)):
            return True
    return False


def find_group_with_id(context, group_id):
    # nacti skupinu z endpointu podle id
    group_resp = context.api_client.get(f"{API_ENDPOINT}{group_id}/")
    assert group_resp.status_code == status.HTTP_200_OK
    group = json.loads(group_resp.content)
    memberships = parse_memberships(group['memberships'])
    # porovnej ziskana data se zaslanymi udaji
    assert group['name'] == context.name
    assert group['course']['name'] == context.course['name']
    assert set(memberships) == set(context.memberships)


def group_dict(context):
    memberships = [{'client_id': helpers.find_client_with_full_name(context.api_client, membership)['id']}
                   for membership in context.memberships]
    return {'name': context.name,
            'course_id': context.course.get('id', ''),
            'memberships': memberships}


@then('the group is added')
def step_impl(context):
    # vlozeni bylo uspesne
    assert context.resp.status_code == status.HTTP_201_CREATED
    # nacti udaje vlozene skupiny
    group_id = json.loads(context.resp.content)['id']
    # podle ID skupiny over, ze souhlasi jeji data
    find_group_with_id(context, group_id)
    # najdi skupinu ve vsech skupinach podle dat
    group_found = find_group(context)
    assert group_found
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
    group_found = find_group(context)
    assert group_found
    assert groups_cnt(context.api_client) == context.old_groups_cnt


@then('the group is deleted')
def step_impl(context):
    # smazani bylo uspesne
    assert context.resp.status_code == status.HTTP_204_NO_CONTENT
    group_found = helpers.find_group_with_name(context.api_client, context.name)
    assert not group_found
    assert groups_cnt(context.api_client) < context.old_groups_cnt


@when('user deletes the group "{name}"')
def step_impl(context, name):
    # nacti jmeno skupiny do kontextu
    context.name = name
    # najdi skupinu
    group_to_delete = helpers.find_group_with_name(context.api_client, name)
    assert group_to_delete
    # uloz puvodni pocet klientu
    context.old_groups_cnt = groups_cnt(context.api_client)
    # smazani skupiny
    context.resp = context.api_client.delete(f"{API_ENDPOINT}{group_to_delete['id']}/")


@then('the group is not added')
def step_impl(context):
    # vlozeni bylo neuspesne
    assert context.resp.status_code == status.HTTP_400_BAD_REQUEST
    # over, ze v odpovedi skutecne neni id skupiny
    group = json.loads(context.resp.content)
    assert 'id' not in group
    group_found = find_group(context)
    assert not group_found
    assert groups_cnt(context.api_client) == context.old_groups_cnt


@when(
    'user updates the data of group "{name}" to name "{new_name}", course "{course}" and clients to "{member_full_name1}", "{member_full_name2}" and "{member_full_name3}"')
def step_impl(context, name, new_name, course, member_full_name1, member_full_name2, member_full_name3):
    # nacteni dat klienta do kontextu
    context.name = name
    context.course = helpers.find_course_with_name(context.api_client, course)
    assert context.course
    context.memberships = [member_full_name1, member_full_name2, member_full_name3]
    # najdi skupinu
    group_to_update = helpers.find_group_with_name(context.api_client, name)
    assert group_to_update
    # uloz puvodni pocet klientu
    context.old_groups_cnt = groups_cnt(context.api_client)
    # vlozeni klienta
    context.resp = context.api_client.put(f"{API_ENDPOINT}{group_to_update['id']}/", group_dict(context))


use_step_matcher("re")


@when(
    'user adds new group "(?P<name>.*)" for course "(?P<course>.*)" with clients "(?P<member_full_name1>.*)" and "(?P<member_full_name2>.*)"')
def step_impl(context, name, course, member_full_name1, member_full_name2):
    # nacteni dat skupiny do kontextu
    context.name = name
    context.course = helpers.find_course_with_name(context.api_client, course)
    context.memberships = []
    if member_full_name1 != '':
        context.memberships.append(member_full_name1)
    if member_full_name2 != '':
        context.memberships.append(member_full_name2)
    # uloz puvodni pocet skupin
    context.old_groups_cnt = groups_cnt(context.api_client)
    # vlozeni skupiny
    context.resp = context.api_client.post(API_ENDPOINT, group_dict(context))
