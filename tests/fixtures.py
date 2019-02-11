from admin.models import Client, Course, Group, Membership, Application, Lecture, AttendanceState, Attendance
from django.contrib.auth import get_user_model
from datetime import datetime
from django.utils.timezone import make_aware


def clients():
    clients_list = [
        Client(name="Petra", surname="Rodová"),
        Client(name="Aneta", surname="Jirušková"),
        Client(name="Lukáš", surname="Rod", phone="555555555", email="r@r.cz", note="test"),
        Client(name="Jaroslav", surname="Uhlíř"),
        Client(name="Pavel", surname="Neaktivní", active=False)
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
        Group(name="Slabika 2", course=courses_list[1]),
        Group(name="Slabika 4", course=courses_list[1]),
        Group(name="Slabika 5", course=courses_list[1], active=False)
    ]
    for group in groups_list:
        group.save()

    memberships_list = [
        Membership(client=clients_list[0], group=groups_list[0]),
        Membership(client=clients_list[4], group=groups_list[1]),
        Membership(client=clients_list[3], group=groups_list[1]),
        Membership(client=clients_list[0], group=groups_list[2]),
        Membership(client=clients_list[1], group=groups_list[2]),
        Membership(client=clients_list[0], group=groups_list[3]),
        Membership(client=clients_list[1], group=groups_list[3])
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
    attendancestates_list = [
        AttendanceState(name="OK", visible=True, default=True),
        AttendanceState(name="omluven", visible=True, excused=True),
        AttendanceState(name="abcd", visible=True),
        AttendanceState(name="skryty", visible=False)
    ]
    for attendancestate in attendancestates_list:
        attendancestate.save()
    return attendancestates_list


def lectures(courses_list, clients_list, groups_list, attendancestates_list):
    start1 = make_aware(datetime(2018, 5, 7, 20, 00))
    lecture1 = Lecture(start=start1, canceled=False, duration=40, course=courses_list[0])
    lecture1.save()
    Attendance(client=clients_list[0], paid=True, lecture=lecture1,
               attendancestate=attendancestates_list[0]).save()
    start2 = make_aware(datetime(2018, 5, 7, 21, 00))
    lecture2 = Lecture(start=start2, canceled=False, duration=40, course=courses_list[0])
    lecture2.save()
    Attendance(client=clients_list[0], paid=False, lecture=lecture2,
               attendancestate=attendancestates_list[0]).save()
