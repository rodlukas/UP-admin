from behave import *
import json
from tests.api_steps import helpers
from rest_framework import status
from tests.common_steps import applications
from tests.api_steps import login_logout


def applications_cnt(api_client):
    return len(helpers.get_applications(api_client))


def find_application(context):
    all_applications = helpers.get_applications(context.api_client)
    # najdi zadost s udaji v kontextu
    for application in all_applications:
        if application_equal_to_context(application, context):
            return True
    return False


def application_equal_to_context(application, context):
    # POZOR - data v kontextu nemusi obsahovat dane klice
    return (application['course']['name'] == context.course.get('name') and
            helpers.client_full_names_equal(application['client'], context.client) and
            application['note'] == context.note)


def find_application_with_id(context, application_id):
    # nacti zadost z endpointu podle id
    application_resp = context.api_client.get(f"{helpers.API_APPLICATIONS}{application_id}/")
    assert application_resp.status_code == status.HTTP_200_OK
    application = json.loads(application_resp.content)
    # porovnej ziskana data se zaslanymi udaji
    assert application_equal_to_context(application, context)


def application_dict(context):
    return {'client_id': context.client.get('id'),
            'course_id': context.course.get('id'),
            'note': context.note}


def load_data_to_context(context, full_name, course, note):
    load_id_data_to_context(context, full_name, course)
    context.note = note


def load_id_data_to_context(context, full_name, course):
    context.client = helpers.find_client_with_full_name(context.api_client, full_name)
    context.course = helpers.find_course_with_name(context.api_client, course)


def save_old_applications_cnt_to_context(context):
    context.old_applications_cnt = applications_cnt(context.api_client)


@then('the application is added')
def step_impl(context):
    # vlozeni bylo uspesne
    assert context.resp.status_code == status.HTTP_201_CREATED
    # nacti udaje vlozene zadosti
    application_id = json.loads(context.resp.content)['id']
    # podle ID zadosti over, ze souhlasi jeji data
    find_application_with_id(context, application_id)
    # najdi zadost ve vsech zadostech podle dat
    assert find_application(context)
    assert applications_cnt(context.api_client) > context.old_applications_cnt


@then('the application is updated')
def step_impl(context):
    # uprava byla uspesna
    assert context.resp.status_code == status.HTTP_200_OK
    # nacti udaje upravovane zadosti
    application_id = json.loads(context.resp.content)['id']
    # podle ID zadosti over, ze souhlasi jeji data
    find_application_with_id(context, application_id)
    # najdi zadost ve vsech zadostech podle dat
    assert find_application(context)
    assert applications_cnt(context.api_client) == context.old_applications_cnt


@then('the application is deleted')
def step_impl(context):
    # smazani bylo uspesne
    assert context.resp.status_code == status.HTTP_204_NO_CONTENT
    assert not helpers.find_application_with_client_and_course(context.api_client, context.client, context.course)
    assert applications_cnt(context.api_client) < context.old_applications_cnt


@when('user deletes the application from client "{full_name}" for course "{course}"')
def step_impl(context, full_name, course):
    # nacti klienta a kurz zadosti do kontextu
    load_id_data_to_context(context, full_name, course)
    # najdi zadost
    application_to_delete = helpers.find_application_with_client_and_course(context.api_client, context.client,
                                                                            context.course)
    assert application_to_delete
    # uloz puvodni pocet zadosti
    save_old_applications_cnt_to_context(context)
    # smazani zadosti
    context.resp = context.api_client.delete(f"{helpers.API_APPLICATIONS}{application_to_delete['id']}/")


@then('the application is not added')
def step_impl(context):
    # vlozeni bylo neuspesne
    assert context.resp.status_code == status.HTTP_400_BAD_REQUEST
    # over, ze v odpovedi skutecne neni id zadosti
    application = json.loads(context.resp.content)
    assert 'id' not in application
    assert not find_application(context)
    assert applications_cnt(context.api_client) == context.old_applications_cnt


@when(
    'user updates the data of the application from client "{cur_full_name}" for course "{cur_course}" to client "{new_full_name}", course "{new_course}" and note "{new_note}"')
def step_impl(context, cur_full_name, cur_course, new_full_name, new_course, new_note):
    # nacteni dat zadosti do kontextu
    load_data_to_context(context, new_full_name, new_course, new_note)
    # najdi zadost
    cur_client_found = helpers.find_client_with_full_name(context.api_client, cur_full_name)
    cur_course_found = helpers.find_course_with_name(context.api_client, cur_course)
    application_to_update = helpers.find_application_with_client_and_course(context.api_client, cur_client_found,
                                                                            cur_course_found)
    assert application_to_update
    # uloz puvodni pocet zadosti
    save_old_applications_cnt_to_context(context)
    # vlozeni zadosti
    context.resp = context.api_client.put(f"{helpers.API_APPLICATIONS}{application_to_update['id']}/", application_dict(context))


use_step_matcher("re")


@when(
    'user adds new application from client "(?P<full_name>.*)" for course "(?P<course>.*)" with note "(?P<note>.*)"')
def step_impl(context, full_name, course, note):
    # nacteni dat zadosti do kontextu
    load_data_to_context(context, full_name, course, note)
    # uloz puvodni pocet zadosti
    save_old_applications_cnt_to_context(context)
    # vlozeni zadosti
    context.resp = context.api_client.post(helpers.API_APPLICATIONS, application_dict(context))
