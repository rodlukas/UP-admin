import json
from copy import deepcopy

from behave import *
from rest_framework import status

from tests import common_helpers
# noinspection PyUnresolvedReferences
from tests.api_steps import helpers, login_logout  # lgtm [py/unused-import]
# noinspection PyUnresolvedReferences
from tests.common_steps import lectures  # lgtm [py/unused-import]


def lectures_cnt(api_client):
    return len(helpers.get_lectures(api_client))


def parse_memberships(memberships_data):
    return [common_helpers.client_full_name(membership['client']['name'], membership['client']['surname']) for
            membership in memberships_data]


def find_lecture(context):
    all_lectures = helpers.get_lectures(context.api_client)
    # najdi lekci s udaji v kontextu
    for lecture in all_lectures:
        if lecture_equal_to_context(lecture, context):
            return True
    return False


def lecture_equal_to_context(lecture, context):
    found_attendances = 0
    for attendance in context.attendances:
        for attendance_api in lecture['attendances']:
            if (attendance['client_id']['id'] == attendance_api['client']['id'] and
                    attendance['attendancestate']['id'] == attendance_api['attendancestate'] and
                    attendance['paid'] == attendance_api['paid'] and
                    attendance['note'] == attendance_api['note']):
                found_attendances += 1
                break
    return (found_attendances == len(context.attendances) and
            lecture['canceled'] == context.canceled and
            context.duration and lecture['duration'] == int(context.duration) and
            common_helpers.parse_django_datetime(lecture['start']) == context.start and
            (
                    (context.is_group and lecture['group']['name'] == context.group['name']) or
                    (not context.is_group and not lecture['group'])
            ))


def find_lecture_with_id(context, lecture_id):
    # nacti lekci z endpointu podle id
    lecture_resp = context.api_client.get(f"{helpers.API_LECTURES}{lecture_id}/")
    assert lecture_resp.status_code == status.HTTP_200_OK
    lecture = json.loads(lecture_resp.content)
    # porovnej ziskana data se zaslanymi udaji
    assert lecture_equal_to_context(lecture, context)


def attendance_dict(api_client, client, attendancestate, paid, note):
    return {'client_id': helpers.find_client_with_full_name(api_client, client),
            'attendancestate': helpers.find_attendancestate_with_name(api_client, attendancestate),
            'paid': common_helpers.to_bool(paid),
            'note': note}


def attendance_dict_patch(attendance_id, **obj):
    obj['id'] = attendance_id
    return obj


def lecture_dict(context, original_lecture=None):
    attendances_res = deepcopy(context.attendances)
    for attendance in attendances_res:
        attendance['client_id'] = attendance['client_id'].get('id')
        attendance['attendancestate'] = attendance['attendancestate'].get('id')
        # pokud je v parametru puvodni lekce (pri uprave), dodej prislusne id upravovane attendance do slovniku
        if original_lecture:
            found_attendance_id = None
            for attendance_original in original_lecture['attendances']:
                if attendance_original['client']['id'] == attendance['client_id']:
                    found_attendance_id = attendance_original['id']
                    break
            attendance['id'] = found_attendance_id

    data = {'start': context.start,
            'duration': context.duration,
            'canceled': context.canceled,
            'attendances': attendances_res}
    if context.is_group:
        data['group_id'] = context.group.get('id')
    else:
        data['course_id'] = context.course.get('id')
    return data


def load_data_to_context(context, obj, date, time, duration, canceled, attendances, is_group=False):
    load_id_data_to_context(context, date, time)
    # pro skupinu je potreba ulozit skupinu, pro jednotlivce pouze kurz (klient je v attendances)
    if is_group:
        context.group = helpers.find_group_with_name(context.api_client, obj)
    else:
        context.course = helpers.find_course_with_name(context.api_client, obj)
    context.is_group = is_group
    context.attendances = attendances
    context.duration = duration
    context.canceled = common_helpers.to_bool(canceled)


def load_id_data_to_context(context, date, time):
    context.start = common_helpers.prepare_start(date, time)


def save_old_lectures_cnt_to_context(context):
    context.old_lectures_cnt = lectures_cnt(context.api_client)


@then('the lecture is added')
def step_impl(context):
    # vlozeni bylo uspesne
    assert context.resp.status_code == status.HTTP_201_CREATED
    # nacti udaje vlozene lekce
    lecture_id = json.loads(context.resp.content)['id']
    # podle ID lekce over, ze souhlasi jeji data
    find_lecture_with_id(context, lecture_id)
    # najdi lekci ve vsech lekcich podle dat
    assert find_lecture(context)
    assert lectures_cnt(context.api_client) > context.old_lectures_cnt


@then('the lecture is updated')
def step_impl(context):
    # uprava byla uspesna
    assert context.resp.status_code == status.HTTP_200_OK
    # nacti udaje upravovane lekce
    lecture_id = json.loads(context.resp.content)['id']
    # podle ID lekce over, ze souhlasi jeji data
    find_lecture_with_id(context, lecture_id)
    # najdi lekci ve vsech lekcich podle dat
    assert find_lecture(context)
    assert lectures_cnt(context.api_client) == context.old_lectures_cnt


@then('the paid state of the attendance is updated')
def step_impl(context):
    # uprava byla uspesna
    assert context.resp.status_code == status.HTTP_200_OK
    # nacti udaje upravovane lekce
    lecture_to_update = helpers.find_lecture_with_start(context.api_client, context.start)
    assert lecture_to_update
    # ma lekce opravdu nove udaje?
    assert lecture_to_update['attendances'][0]['paid'] == context.new_paid


@then('the attendance state of the attendance is updated')
def step_impl(context):
    # uprava byla uspesna
    assert context.resp.status_code == status.HTTP_200_OK
    # nacti udaje upravovane lekce
    lecture_to_update = helpers.find_lecture_with_start(context.api_client, context.start)
    assert lecture_to_update
    # ma lekce opravdu nove udaje?
    assert lecture_to_update['attendances'][0]['attendancestate'] == context.new_attendancestate['id']
    # pokud se lekce nove zmenila na omluvenou a byla zaplacena, over pridani nahradni lekce
    excused_attendancestate = common_helpers.get_excused_attendancestate()
    if (context.cur_attendancestate['name'] != excused_attendancestate and
            context.new_attendancestate['name'] == excused_attendancestate and
            lecture_to_update['attendances'][0]['paid']):
        assert lectures_cnt(context.api_client) == context.old_lectures_cnt + 1
    else:
        assert lectures_cnt(context.api_client) == context.old_lectures_cnt


@then('the lecture is deleted')
def step_impl(context):
    # smazani bylo uspesne
    assert context.resp.status_code == status.HTTP_204_NO_CONTENT
    assert not helpers.find_lecture_with_start(context.api_client, context.start)
    assert lectures_cnt(context.api_client) < context.old_lectures_cnt


@when('user deletes the lecture of the client "{client}" at "{date}", "{time}"')
def step_impl(context, client, date, time):
    # nacti timestamp lekce do kontextu
    load_id_data_to_context(context, date, time)
    # najdi lekci
    lecture_to_delete = helpers.find_lecture_with_start(context.api_client, context.start)
    assert lecture_to_delete
    # uloz puvodni pocet lekci
    save_old_lectures_cnt_to_context(context)
    # smazani lekce
    context.resp = context.api_client.delete(f"{helpers.API_LECTURES}{lecture_to_delete['id']}/")


@then('the lecture is not added')
def step_impl(context):
    # vlozeni bylo neuspesne
    assert context.resp.status_code == status.HTTP_400_BAD_REQUEST
    # over, ze v odpovedi skutecne neni id lekce
    lecture = json.loads(context.resp.content)
    assert 'id' not in lecture
    assert not find_lecture(context)
    assert lectures_cnt(context.api_client) == context.old_lectures_cnt


@when(
    'user updates the data of lecture at "{date}", "{time}" to date "{new_date}", time "{new_time}", course "{new_course}", duration "{new_duration}", canceled "{new_canceled}", attendance of the client "{client}" is: "{new_attendancestate}", paid "{new_paid}", note "{new_note}"')
def step_impl(context, date, time, new_date, new_time, new_course, new_duration, new_canceled, client,
              new_attendancestate, new_paid, new_note):
    new_attendances = [attendance_dict(context.api_client, client, new_attendancestate, new_paid, new_note)]
    # nacteni dat lekce do kontextu
    load_data_to_context(context, new_course, new_date, new_time, new_duration, new_canceled, new_attendances)
    # najdi lekci
    lecture_to_update = helpers.find_lecture_with_start(context.api_client, common_helpers.prepare_start(date, time))
    assert lecture_to_update
    # uloz puvodni pocet lekci
    save_old_lectures_cnt_to_context(context)
    # vlozeni lekce
    context.resp = context.api_client.put(f"{helpers.API_LECTURES}{lecture_to_update['id']}/", lecture_dict(context,
                                                                                                            lecture_to_update))


@when(
    'user updates the paid state of lecture of the client "{client}" at "{date}", "{time}" to "{new_paid}"')
def step_impl(context, client, date, time, new_paid):
    # nacteni dat lekce do kontextu
    load_id_data_to_context(context, date, time)
    # najdi lekci
    lecture_to_update = helpers.find_lecture_with_start(context.api_client, common_helpers.prepare_start(date, time))
    assert lecture_to_update
    # najdi id attendance
    attendance_id = lecture_to_update['attendances'][0]['id']
    # vlozeni lekce
    content = attendance_dict_patch(attendance_id, paid=new_paid)
    context.resp = context.api_client.patch(f"{helpers.API_ATTENDANCES}{attendance_id}/", content)
    # uloz ocekavany novy stav do kontextu
    context.new_paid = common_helpers.to_bool(new_paid)


@when(
    'user updates the attendance state of lecture of the client "{client}" at "{date}", "{time}" to "{new_attendancestate}"')
def step_impl(context, client, date, time, new_attendancestate):
    new_attendancestate = helpers.find_attendancestate_with_name(context.api_client, new_attendancestate)
    # nacteni dat lekce do kontextu
    load_id_data_to_context(context, date, time)
    # najdi lekci
    lecture_to_update = helpers.find_lecture_with_start(context.api_client, common_helpers.prepare_start(date, time))
    assert lecture_to_update
    # najdi id attendance
    attendance_id = lecture_to_update['attendances'][0]['id']
    attendancestate_id = lecture_to_update['attendances'][0]['attendancestate']
    # uloz puvodni pocet lekci
    save_old_lectures_cnt_to_context(context)
    # vlozeni lekce
    content = attendance_dict_patch(attendance_id, attendancestate=new_attendancestate['id'])
    context.resp = context.api_client.patch(f"{helpers.API_ATTENDANCES}{attendance_id}/", content)
    # uloz ocekavany novy a aktualni stav do kontextu
    context.new_attendancestate = new_attendancestate
    context.cur_attendancestate = helpers.find_attendancestate_with_id(context.api_client, attendancestate_id)


use_step_matcher("re")


@when(
    'user adds new group lecture for group "(?P<group>.*)" with date "(?P<date>.*)", time "(?P<time>.*)", duration "(?P<duration>.*)", canceled "(?P<canceled>.*)", attendance of the client "(?P<client1>.*)" is: "(?P<attendancestate1>.*)", paid "(?P<paid1>.*)", note "(?P<note1>.*)" and attendance of the client "(?P<client2>.*)" is: "(?P<attendancestate2>.*)", paid "(?P<paid2>.*)", note "(?P<note2>.*)"')
def step_impl(context, group, date, time, duration, canceled, client1, attendancestate1, paid1, note1, client2,
              attendancestate2, paid2, note2):
    attendances = [attendance_dict(context.api_client, client1, attendancestate1, paid1, note1),
                   attendance_dict(context.api_client, client2, attendancestate2, paid2, note2)]
    # nacteni dat lekce do kontextu
    load_data_to_context(context, group, date, time, duration, canceled, attendances, is_group=True)
    # uloz puvodni pocet lekci
    save_old_lectures_cnt_to_context(context)
    # vlozeni lekce
    context.resp = context.api_client.post(helpers.API_LECTURES, lecture_dict(context))


@when(
    'user adds new single lecture for client "(?P<client>.*)" for course "(?P<course>.*)" with date "(?P<date>.*)", time "(?P<time>.*)", duration "(?P<duration>.*)", canceled "(?P<canceled>.*)", attendance of the client is: "(?P<attendancestate>.*)", paid "(?P<paid>.*)", note "(?P<note>.*)"')
def step_impl(context, client, course, date, time, duration, canceled, attendancestate, paid, note):
    attendances = [attendance_dict(context.api_client, client, attendancestate, paid, note)]
    # nacteni dat lekce do kontextu
    load_data_to_context(context, course, date, time, duration, canceled, attendances)
    # uloz puvodni pocet lekci
    save_old_lectures_cnt_to_context(context)
    # vlozeni lekce
    context.resp = context.api_client.post(helpers.API_LECTURES, lecture_dict(context))
