from admin.models import Client
from django.contrib.auth import get_user_model

WAIT_TIME = 10


def add_two_clients():
    Client(name="Lukáš", surname="Rod").save()
    Client(name="Aneta", surname="Jirušková").save()


def api_url(url):
    return "/api/v1" + url


def add_user():
    user = get_user_model()
    username = 'test-username'
    password = 'test-password'
    user.objects.create_user(
        username=username,
        email='testuser@test.cz',
        password=password
    )
    return {'username': username, 'password': password}


def frontend_empty_str(text):
    return "---" if text == "" else text
