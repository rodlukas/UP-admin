from behave import given, when, then, step
from admin.models import Client
from up.settings import JWT_AUTH
import json
from tests import helpers


@then('the client is added')
def step_impl(context):
    qs = Client.objects.filter(name=context.name, surname=context.surname)
    assert len(qs) == 1


@given("the database with some clients")
def step_impl(context):
    helpers.add_two_clients()
    assert Client.objects.count() >= 2


@when('user adds new client')
def step_impl(context):
    context.name = "Josef"
    context.surname = "Voříšek"
    assert Client.objects.filter(name=context.name, surname=context.surname).count() == 0
    context.client.post(helpers.api_url("/clients/"), {'name': context.name, 'surname': context.surname})


@step("the user is logged")
def step_impl(context):
    user = helpers.add_user()
    response = context.client.post(helpers.api_url("/jwt-auth/"),
                                   {"username": user['username'], "password": user['password']})
    response_json = json.loads(response.content)
    assert response.status_code == 200
    assert 'token' in response_json
    token = response_json['token']
    jwt_token = JWT_AUTH['JWT_AUTH_HEADER_PREFIX'] + " " + token
    context.client.credentials(HTTP_AUTHORIZATION=jwt_token)
