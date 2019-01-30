from behave import *
from tests.api_steps import helpers
from up.settings import JWT_AUTH
from rest_framework import status
import json
from tests.common_steps import login_logout


def login(context, username, password):
    # prihlas se
    return context.api_client.post(helpers.API_AUTH,
                                   {"username": username,
                                    "password": password})


@When('user logs into app with correct credentials')
def step_impl(context):
    context.auth_resp = login(context, context.user['username'], context.user['password'])


@When('user logs into app with wrong credentials')
def step_impl(context):
    context.auth_resp = login(context, context.user['username'], "wrongPassword")


@Then('user is logged into app')
def step_impl(context):
    assert context.auth_resp.status_code == status.HTTP_200_OK
    auth = json.loads(context.auth_resp.content)
    assert 'token' in auth
    # uloz do klienta token pro dalsi pozadavky
    token = auth['token']
    jwt_token = JWT_AUTH['JWT_AUTH_HEADER_PREFIX'] + " " + token
    context.api_client.credentials(HTTP_AUTHORIZATION=jwt_token)


@Then('user is not logged into app')
def step_impl(context):
    assert context.auth_resp.status_code != status.HTTP_200_OK
    auth = json.loads(context.auth_resp.content)
    assert 'token' not in auth


@When('user logs out of app')
def step_impl(context):
    # smaz vsechny nastavene credentials v klientovi
    context.api_client.credentials()


@Then('user is logged out of app')
def step_impl(context):
    # posli dotaz na endpoint - vyzaduje prihlaseni
    resp = context.api_client.get(helpers.API_CLIENTS)
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED
