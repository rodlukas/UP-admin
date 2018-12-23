from behave import given, when, then, step
from admin.models import Client
from up.settings import JWT_AUTH
import json
from django.contrib.auth import get_user_model


@then('the client is added')
def step_impl(context):
    qs = Client.objects.filter(name=context.name, surname=context.surname)
    assert len(qs) == 1


@given("the database with some clients")
def step_impl(context):
    Client(name="Lukas", surname="Rod").save()
    Client(name="Aneta", surname="Jiruskova").save()
    assert Client.objects.count() > 0


@when('user adds new client')
def step_impl(context):
    context.name = "Josef"
    context.surname = "Voříšek"
    assert Client.objects.filter(name=context.name, surname=context.surname).count() == 0
    context.client.post('/api/v1/clients/', {'name': context.name, 'surname': context.surname}, format='json')


@step("the user is logged")
def step_impl(context):
    user = get_user_model()
    user.objects.create_user(
        username='test',
        email='testuser@test.cz',
        password='test'
    )
    response = context.client.post("/api/v1/jwt-auth/", {"username": "test", "password": "test"})
    token = json.loads(response.content)['token']
    assert response.status_code == 200
    jwt_token = JWT_AUTH['JWT_AUTH_HEADER_PREFIX'] + " " + token
    context.client.credentials(HTTP_AUTHORIZATION=jwt_token)
