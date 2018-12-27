from behave import *
from tests.api_steps import helpers
from up.settings import JWT_AUTH
from rest_framework import status
import json
from tests.common_steps import login_logout


@When('user logs into app')
def step_impl(context):
    # prihlas se
    context.auth_resp = context.api_client.post(helpers.API_AUTH,
                                                {"username": context.user['username'],
                                                 "password": context.user['password']})


@Then('user is logged into app')
def step_impl(context):
    assert context.auth_resp.status_code == status.HTTP_200_OK
    auth = json.loads(context.auth_resp.content)
    assert 'token' in auth
    # uloz do klienta token pro dalsi pozadavky
    token = auth['token']
    jwt_token = JWT_AUTH['JWT_AUTH_HEADER_PREFIX'] + " " + token
    context.api_client.credentials(HTTP_AUTHORIZATION=jwt_token)


@When('user logs out of app')
def step_impl(context):
    # smaz vsechny nastavene credentials v klientovi
    context.api_client.credentials()


@Then('user is logged out of app')
def step_impl(context):
    # posli dotaz na endpoint - vyzaduje prihlaseni
    resp = context.api_client.get(helpers.API_CLIENTS)
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED
