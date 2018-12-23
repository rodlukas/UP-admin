from behave import *
from admin.models import Client
from up.settings import JWT_AUTH
import json
from tests import helpers
from tests.common_steps import clients


@then('the client is added')
def step_impl(context):
    qs = Client.objects.filter(name=context.name, surname=context.surname)
    assert len(qs) == 1


@when('user adds new client')
def step_impl(context):
    context.name = "Josef"
    context.surname = "Voříšek"
    context.client.post(helpers.api_url("/clients/"), {'name': context.name, 'surname': context.surname})


@given("the user is logged")
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
