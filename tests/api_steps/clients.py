from behave import *
import json
from tests import helpers
from rest_framework import status
from tests.common_steps import clients
from tests.api_steps import common

API_ENDPOINT = helpers.api_url("/clients/")


def get_clients(api_client):
    all_clients_resp = api_client.get(API_ENDPOINT)
    assert all_clients_resp.status_code == status.HTTP_200_OK
    return json.loads(all_clients_resp.content)


def clients_cnt(api_client):
    return len(get_clients(api_client))


def parse_client_full_name(full_name):
    full_name = full_name.split()
    return {'surname': full_name[0], 'name': full_name[1]}


def find_client(context):
    all_clients = get_clients(context.api_client)
    # najdi klienta s udaji v kontextu
    for client in all_clients:
        if (client['name'] == context.name and
                client['surname'] == context.surname and
                client['phone'] == helpers.shrink_str(context.phone) and
                client['email'] == context.email and
                client['note'] == context.note):
            return True
    return False


def find_client_with_full_name(api_client, full_name):
    all_clients = get_clients(api_client)
    full_name_parsed = parse_client_full_name(full_name)
    for client in all_clients:
        if (client['name'] == full_name_parsed['name'] and
                client['surname'] == full_name_parsed['surname']):
            return client
    return False


def find_client_with_id(context, client_id):
    # nacti klienta z endpointu podle id
    client_resp = context.api_client.get(f"{API_ENDPOINT}{client_id}/")
    assert client_resp.status_code == status.HTTP_200_OK
    client = json.loads(client_resp.content)
    # porovnej ziskana data se zaslanymi udaji
    assert client['name'] == context.name
    assert client['surname'] == context.surname
    assert client['phone'] == helpers.shrink_str(context.phone)
    assert client['email'] == context.email
    assert client['note'] == context.note


def client_dict(context):
    return {'name': context.name,
            'surname': context.surname,
            'phone': context.phone,
            'email': context.email,
            'note': context.note}


@then('the client is added')
def step_impl(context):
    # vlozeni bylo uspesne
    assert context.resp.status_code == status.HTTP_201_CREATED
    # nacti udaje vlozeneho klienta
    client_id = json.loads(context.resp.content)['id']
    # podle ID klienta over, ze souhlasi jeho data
    find_client_with_id(context, client_id)
    # najdi klienta ve vsech klientech podle dat
    client_found = find_client(context)
    assert client_found
    assert clients_cnt(context.api_client) > context.old_clients_cnt


@then('the client is updated')
def step_impl(context):
    # uprava byla uspesna
    assert context.resp.status_code == status.HTTP_200_OK
    # nacti udaje upravovaneho klienta
    client_id = json.loads(context.resp.content)['id']
    # podle ID klienta over, ze souhlasi jeho data
    find_client_with_id(context, client_id)
    # najdi klienta ve vsech klientech podle dat
    client_found = find_client(context)
    assert client_found
    assert clients_cnt(context.api_client) == context.old_clients_cnt


@then('the client is deleted')
def step_impl(context):
    # TODO
    ...


@when('user deletes the client "{full_name}"')
def step_impl(context, full_name):
    # TODO
    ...


@then('the client is not added')
def step_impl(context):
    # vlozeni bylo neuspesne
    assert context.resp.status_code == status.HTTP_400_BAD_REQUEST
    # over, ze v odpovedi skutecne neni id klienta
    client = json.loads(context.resp.content)
    assert 'id' not in client
    client_found = find_client(context)
    assert not client_found
    assert clients_cnt(context.api_client) == context.old_clients_cnt


use_step_matcher("re")


@when(
    'user adds new client "(?P<name>.*)" "(?P<surname>.*)" with phone "(?P<phone>.*)", email "(?P<email>.*)" and note "(?P<note>.*)"')
def step_impl(context, name, surname, phone, email, note):
    # nacteni dat klienta do kontextu
    context.name = name
    context.surname = surname
    context.phone = phone
    context.email = email
    context.note = note
    # uloz puvodni pocet klientu
    context.old_clients_cnt = clients_cnt(context.api_client)
    # vlozeni klienta
    context.resp = context.api_client.post(API_ENDPOINT, client_dict(context))


@when(
    'user updates the data of client "(?P<full_name>.*)" to name "(?P<new_name>.*)", surname "(?P<new_surname>.*)", phone "(?P<new_phone>.*)", email "(?P<new_email>.*)" and note "(?P<new_note>.*)"')
def step_impl(context, full_name, new_name, new_surname, new_phone, new_email, new_note):
    # nacteni dat klienta do kontextu
    context.name = new_name
    context.surname = new_surname
    context.phone = new_phone
    context.email = new_email
    context.note = new_note
    # najdi klienta
    client_to_update = find_client_with_full_name(context.api_client, full_name)
    assert client_to_update
    # uloz puvodni pocet klientu
    context.old_clients_cnt = clients_cnt(context.api_client)
    # vlozeni klienta
    context.resp = context.api_client.put(f"{API_ENDPOINT}{client_to_update['id']}/", client_dict(context))
