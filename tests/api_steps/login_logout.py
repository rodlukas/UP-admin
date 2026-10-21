import json

from behave import when, then, use_step_matcher
from django.conf import settings
from rest_framework import status

from tests.api_steps import helpers

# jine moduly nechavaji matcher na "re"; bez explicitniho parse by se kroky
# registrovaly jako regularni vyrazy
use_step_matcher("parse")

# noinspection PyUnresolvedReferences
from tests.common_steps import login_logout


def login(context, username, password):
    # prihlas se
    return context.api_client.post(helpers.API_AUTH, {"username": username, "password": password})


@when("user logs into app with correct credentials")
def step_impl(context):
    context.auth_resp = login(context, context.user["username"], context.user["password"])


@when("user logs into app with wrong credentials")
def step_impl(context):
    context.auth_resp = login(context, context.user["username"], "wrongPassword")


@then("user is logged into app")
def step_impl(context):
    assert context.auth_resp.status_code == status.HTTP_200_OK
    auth = json.loads(context.auth_resp.content)
    assert "token" in auth
    # uloz do klienta token pro dalsi pozadavky
    token = auth["token"]
    jwt_token = settings.SIMPLE_JWT["AUTH_HEADER_TYPES"][0] + " " + token
    context.api_client.credentials(HTTP_AUTHORIZATION=jwt_token)


@then("user is not logged into app")
def step_impl(context):
    assert context.auth_resp.status_code != status.HTTP_200_OK
    auth = json.loads(context.auth_resp.content)
    assert "token" not in auth


@when("user logs out of app")
def step_impl(context):
    # smaz vsechny nastavene credentials v klientovi
    context.api_client.credentials()


@then("user is logged out of app")
def step_impl(context):
    # posli dotaz na endpoint - vyzaduje prihlaseni
    resp = context.api_client.get(helpers.API_CLIENTS)
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED


@when("user requests the client list without logging in")
def step_impl(context):
    # predchozi scenar mohl v klientovi nechat token
    context.api_client.credentials()
    context.resp = context.api_client.get(helpers.API_CLIENTS)


@then("the request is rejected as unauthorized")
def step_impl(context):
    assert context.resp.status_code == status.HTTP_401_UNAUTHORIZED
