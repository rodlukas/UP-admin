from behave import *
from tests import helpers
from up.settings import JWT_AUTH
from rest_framework import status
import json


@given('the user is logged')
def step_impl(context):
    # prihlas se
    auth_resp = context.client.post(helpers.api_url("/jwt-auth/"),
                                    {"username": context.user['username'], "password": context.user['password']})
    auth_resp_json = json.loads(auth_resp.content)
    assert auth_resp.status_code == status.HTTP_200_OK
    assert 'token' in auth_resp_json
    # uloz to klienta token pro dalsi pozadavky
    token = auth_resp_json['token']
    jwt_token = JWT_AUTH['JWT_AUTH_HEADER_PREFIX'] + " " + token
    context.client.credentials(HTTP_AUTHORIZATION=jwt_token)
