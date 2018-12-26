from admin.models import Client, Course, Group, Membership
from django.contrib.auth import get_user_model


def clients():
    clients_list = [
        Client(name="Petra", surname="Rodová"),
        Client(name="Aneta", surname="Jirušková"),
        Client(name="Lukáš", surname="Rod", phone="555555555", email="r@r.cz", note="test"),
        Client(name="Jaroslav", surname="Uhlíř")
    ]
    for client in clients_list:
        client.save()
    return clients_list


def courses():
    courses_list = [
        Course(name="Kurz Slabika", visible=True),
        Course(name="Předškolák s ADHD", visible=True),
        Course(name="Máme doma leváka", visible=True)
    ]
    for course in courses_list:
        course.save()
    return courses_list


def groups(courses_list, clients_list):
    groups_list = [
        Group(name="Slabika 1", course=courses_list[0]),
        Group(name="Slabika 2", course=courses_list[1])
    ]
    for group in groups_list:
        group.save()

    memberships_list = [
        Membership(client=clients_list[0], group=groups_list[0])
    ]
    for membership in memberships_list:
        membership.save()
    return groups_list


def user():
    user = get_user_model()
    username = 'test-username'
    password = 'test-password'
    user.objects.create_user(
        username=username,
        email='testuser@test.cz',
        password=password
    )
    return {'username': username, 'password': password}
