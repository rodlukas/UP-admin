import json

from behave import *
from rest_framework import status

from tests import common_helpers
# noinspection PyUnresolvedReferences
from tests.api_steps import helpers, login_logout
# noinspection PyUnresolvedReferences
from tests.common_steps import courses


def courses_cnt(api_client):
    return len(helpers.get_courses(api_client))


def find_course(context):
    all_courses = helpers.get_courses(context.api_client)
    # najdi kurz s udaji v kontextu
    for course in all_courses:
        if course_equal_to_context(course, context):
            return True
    return False


def course_equal_to_context(course, context):
    return (course['name'] == context.name and
            course['visible'] == context.visible and
            course['duration'] == int(context.duration))


def find_course_with_id(context, course_id):
    # nacti kurz z endpointu podle id
    course_resp = context.api_client.get(f"{helpers.API_COURSES}{course_id}/")
    assert course_resp.status_code == status.HTTP_200_OK
    course = json.loads(course_resp.content)
    # porovnej ziskana data se zaslanymi udaji
    assert course_equal_to_context(course, context)


def course_dict(context):
    return {'name': context.name,
            'visible': context.visible,
            'duration': context.duration}


def load_data_to_context(context, name, visible, duration):
    load_id_data_to_context(context, name)
    context.visible = common_helpers.to_bool(visible)
    context.duration = duration


def load_id_data_to_context(context, name):
    context.name = name


def save_old_courses_cnt_to_context(context):
    context.old_courses_cnt = courses_cnt(context.api_client)


@then('the course is added')
def step_impl(context):
    # vlozeni bylo uspesne
    assert context.resp.status_code == status.HTTP_201_CREATED
    # nacti udaje vlozene kurzu
    course_id = json.loads(context.resp.content)['id']
    # podle ID kurzu over, ze souhlasi jeho data
    find_course_with_id(context, course_id)
    # najdi kurz ve vsech kurzech podle dat
    assert find_course(context)
    assert courses_cnt(context.api_client) > context.old_courses_cnt


@then('the course is updated')
def step_impl(context):
    # uprava byla uspesna
    assert context.resp.status_code == status.HTTP_200_OK
    # nacti udaje upravovane kurzu
    course_id = json.loads(context.resp.content)['id']
    # podle ID kurzu over, ze souhlasi jeho data
    find_course_with_id(context, course_id)
    # najdi kurz ve vsech kurzech podle dat
    assert find_course(context)
    assert courses_cnt(context.api_client) == context.old_courses_cnt


@then('the course is deleted')
def step_impl(context):
    # smazani bylo uspesne
    assert context.resp.status_code == status.HTTP_204_NO_CONTENT
    assert not helpers.find_course_with_name(context.api_client, context.name)
    assert courses_cnt(context.api_client) < context.old_courses_cnt


@when('user deletes the course "{name}"')
def step_impl(context, name):
    # nacti jmeno kurzu do kontextu
    load_id_data_to_context(context, name)
    # najdi kurz
    course_to_delete = helpers.find_course_with_name(context.api_client, context.name)
    assert course_to_delete
    # uloz puvodni pocet kurzu
    save_old_courses_cnt_to_context(context)
    # smazani kurzu
    context.resp = context.api_client.delete(f"{helpers.API_COURSES}{course_to_delete['id']}/")


@then('the course is not added')
def step_impl(context):
    # vlozeni bylo neuspesne
    assert context.resp.status_code == status.HTTP_400_BAD_REQUEST
    # over, ze v odpovedi skutecne neni id kurzu
    course = json.loads(context.resp.content)
    assert 'id' not in course
    assert not find_course(context)
    assert courses_cnt(context.api_client) == context.old_courses_cnt


@when(
    'user updates the data of course "{cur_name}" to name "{new_name}", visibility "{new_visible}" and duration "{new_duration}"')
def step_impl(context, cur_name, new_name, new_visible, new_duration):
    # nacteni dat kurzu do kontextu
    load_data_to_context(context, new_name, new_visible, new_duration)
    # najdi kurz
    course_to_update = helpers.find_course_with_name(context.api_client, cur_name)
    assert course_to_update
    # uloz puvodni pocet kurzu
    save_old_courses_cnt_to_context(context)
    # vlozeni kurzu
    context.resp = context.api_client.put(f"{helpers.API_COURSES}{course_to_update['id']}/",
                                          course_dict(context))


use_step_matcher("re")


@when('user adds new course "(?P<name>.*)" with visibility "(?P<visible>.*)" and duration "(?P<duration>.*)"')
def step_impl(context, name, visible, duration):
    # nacteni dat kurzu do kontextu
    load_data_to_context(context, name, visible, duration)
    # uloz puvodni pocet kurzu
    save_old_courses_cnt_to_context(context)
    # vlozeni kurzu
    context.resp = context.api_client.post(helpers.API_COURSES, course_dict(context))
