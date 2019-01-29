from admin.models import Client, Course, Group, Membership, Application, Lecture, AttendanceState, Attendance
from django.contrib.auth import get_user_model
from datetime import datetime
from django.utils.timezone import make_aware


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
        Group(name="Slabika 2", course=courses_list[1]),
        Group(name="Slabika 4", course=courses_list[1])
    ]
    for group in groups_list:
        group.save()

    memberships_list = [
        Membership(client=clients_list[0], group=groups_list[0]),
        Membership(client=clients_list[0], group=groups_list[2]),
        Membership(client=clients_list[1], group=groups_list[2])
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
        AttendanceState(name="OK", visible=True),
        AttendanceState(name="omluven", visible=True),
        AttendanceState(name="skryty", visible=False)
    ]
    for attendancestate in attendancestates_list:
        attendancestate.save()
    return attendancestates_list


def lectures(courses_list, clients_list, groups_list, attendancestates_list):
    start = make_aware(datetime(2018, 5, 7, 20, 00))
    lecture = Lecture(start=start, canceled=False, duration=40, course=courses_list[0])
    lecture.save()
    attendance = Attendance(client=clients_list[0], paid=True, lecture=lecture,
                            attendancestate=attendancestates_list[1])
    attendance.save()
