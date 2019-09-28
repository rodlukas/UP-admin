import json

from rest_framework import status

from tests import common_helpers


def api_url(url):
    return "/api/v1" + url


API_ATTENDANCES = api_url("/attendances/")
API_APPLICATIONS = api_url("/applications/")
API_ATTENDANCESTATES = api_url("/attendancestates/")
API_AUTH = api_url("/jwt-auth/")
API_CLIENTS = api_url("/clients/")
API_COURSES = api_url("/courses/")
API_GROUPS = api_url("/groups/")
API_LECTURES = api_url("/lectures/")


def parse_client_full_name(full_name):
    # POZOR - muze byt zaslan prazdny string
    full_name = full_name.split()
    if len(full_name) == 2:
        return {"surname": full_name[0], "firstname": full_name[1]}
    return {"surname": "", "firstname": ""}


def find_client_with_full_name(api_client, full_name):
    all_clients = get_clients(api_client)
    full_name_parsed = parse_client_full_name(full_name)
    for client in all_clients:
        if (
            client["firstname"] == full_name_parsed["firstname"]
            and client["surname"] == full_name_parsed["surname"]
        ):
            return client
    return {}


def find_group_with_name(api_client, name):
    all_groups = get_groups(api_client)
    for group in all_groups:
        if group["name"] == name:
            return group
    return {}


def find_lecture_with_start(api_client, start):
    all_lectures = get_lectures(api_client)
    for lecture in all_lectures:
        # muze prijit None (predplacena lekce)
        if lecture["start"] and common_helpers.parse_django_datetime(lecture["start"]) == start:
            return lecture
    return {}


def find_attendancestate_with_name(api_client, name):
    all_attendancestates = get_attendancestates(api_client)
    for attendancestate in all_attendancestates:
        if attendancestate["name"] == name:
            return attendancestate
    return {}


def find_attendancestate_with_id(api_client, attendancestate_id):
    attendancestate_resp = api_client.get(f"{API_ATTENDANCESTATES}{attendancestate_id}/")
    attendancestate = json.loads(attendancestate_resp.content)
    return attendancestate


def client_full_names_equal(client1, client2):
    # POZOR - data v kontextu nemusi obsahovat dane klice
    client1_full_name = common_helpers.client_full_name(
        client1.get("firstname"), client1.get("surname")
    )
    client2_full_name = common_helpers.client_full_name(
        client2.get("firstname"), client2.get("surname")
    )
    return client1_full_name == client2_full_name


def find_application_with_client_and_course(api_client, client, course):
    all_applications = get_applications(api_client)
    for application in all_applications:
        if (
            client_full_names_equal(application["client"], client)
            and application["course"]["name"] == course["name"]
        ):
            return application
    return {}


def find_course_with_name(api_client, name):
    all_courses = get_courses(api_client)
    for course in all_courses:
        if course["name"] == name:
            return course
    return {}


def get_api_response(api_client, API_URL):
    resp = api_client.get(API_URL)
    assert resp.status_code == status.HTTP_200_OK
    return json.loads(resp.content)


def get_clients(api_client):
    return get_api_response(api_client, API_CLIENTS)


def get_attendancestates(api_client):
    return get_api_response(api_client, API_ATTENDANCESTATES)


def get_groups(api_client):
    return get_api_response(api_client, API_GROUPS)


def get_lectures(api_client):
    return get_api_response(api_client, API_LECTURES)


def get_courses(api_client):
    return get_api_response(api_client, API_COURSES)


def get_applications(api_client):
    return get_api_response(api_client, API_APPLICATIONS)
