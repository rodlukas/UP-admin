from behave import *
from tests import helpers
from up.settings import JWT_AUTH
from rest_framework import status
import json


@given('the user is logged')
def step_impl(context):
    # prihlas se
    auth_resp = context.api_client.post(helpers.api_url("/jwt-auth/"),
                                        {"username": context.user['username'], "password": context.user['password']})
    auth = json.loads(auth_resp.content)
    assert auth_resp.status_code == status.HTTP_200_OK
    assert 'token' in auth
    # uloz to klienta token pro dalsi pozadavky
    token = auth['token']
    jwt_token = JWT_AUTH['JWT_AUTH_HEADER_PREFIX'] + " " + token
    context.api_client.credentials(HTTP_AUTHORIZATION=jwt_token)
