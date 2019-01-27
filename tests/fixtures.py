from admin.models import Client, Course, Group, Membership, Application, AttendanceState
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
        Course(name="Kurz Slabika", visible=True, duration=20),
        Course(name="Předškolák s ADHD", visible=True, duration=30),
        Course(name="Máme doma leváka", visible=False, duration=40),
        Course(name="xyz", visible=True, duration=10)
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
    user_model = get_user_model()
    username = 'test-username'
    password = 'test-password'
    user_model.objects.create_user(
        username=username,
        email='testuser@test.cz',
        password=password
    )
    return {'username': username, 'password': password}


def applications(courses_list, clients_list):
    Application(client=clients_list[2], course=courses_list[0]).save()
    Application(client=clients_list[3], course=courses_list[1], note="abcd").save()


def attendancestates():
    AttendanceState(name="OK", visible=True).save()
    AttendanceState(name="omluven", visible=False).save()
