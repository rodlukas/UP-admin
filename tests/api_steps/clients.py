from behave import *
import json
from tests import helpers
from rest_framework import status
from tests.common_steps import clients
from tests.api_steps import common


def find_client(context):
    # ziskej seznam vsech klientu a over, ze se skutecne nepridal
    all_clients = context.client.get(helpers.api_url("/clients/"))
    assert all_clients.status_code == status.HTTP_200_OK
    all_clients_json = json.loads(all_clients.content)
    for client in all_clients_json:
        if (client['name'] == context.name and
                client['surname'] == context.surname and
                client['phone'] == helpers.shrink_str(context.phone) and
                client['email'] == context.email and
                client['note'] == context.note):
            return True
    return False


def find_client_with_id(context, new_client_id):
    # nacti klienta z endpointu podle id
    new_client_resp = context.client.get(helpers.api_url(f"/clients/{new_client_id}/"))
    assert new_client_resp.status_code == status.HTTP_200_OK
    new_client_data_json = json.loads(new_client_resp.content)
    # porovnej ziskana data se zaslanymi udaji
    assert new_client_data_json['name'] == context.name
    assert new_client_data_json['surname'] == context.surname
    assert new_client_data_json['phone'] == helpers.shrink_str(context.phone)
    assert new_client_data_json['email'] == context.email
    assert new_client_data_json['note'] == context.note


@then('the client is added')
def step_impl(context):
    # vlozeni bylo uspesne
    assert context.resp.status_code == status.HTTP_201_CREATED
    # nacti udaje vlozeneho klienta
    new_client_id = json.loads(context.resp.content)['id']
    # najdi klienta podle id
    find_client_with_id(context, new_client_id)
    # najdi klienta ve vsech klientech podle dat
    client_found = find_client(context)
    assert client_found


@then('the client is updated')
def step_impl(context):
    # TODO
    ...


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
    new_client = json.loads(context.resp.content)
    assert 'id' not in new_client
    client_found = find_client(context)
    assert not client_found


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
    # vlozeni klienta
    context.resp = context.client.post(helpers.api_url("/clients/"),
                                       {'name': context.name,
                                        'surname': context.surname,
                                        'phone': context.phone,
                                        'email': context.email,
                                        'note': context.note})


@when(
    'user updates the data of client "(?P<full_name>.*)" to name "(?P<new_name>.*)", surname "(?P<new_surname>.*)", phone "(?P<new_phone>.*)", email "(?P<new_email>.*)" and note "(?P<new_note>.*)"')
def step_impl(context, full_name, new_name, new_surname, new_phone, new_email, new_note):
    # TODO
    ...
