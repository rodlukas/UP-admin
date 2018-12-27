import json
from rest_framework import status


def parse_client_full_name(full_name):
    full_name = full_name.split()
    return {'surname': full_name[0], 'name': full_name[1]}


def api_url(url):
    return "/api/v1" + url


def find_client_with_full_name(api_client, full_name):
    all_clients = get_clients(api_client)
    full_name_parsed = parse_client_full_name(full_name)
    for client in all_clients:
        if (client['name'] == full_name_parsed['name'] and
                client['surname'] == full_name_parsed['surname']):
            return client
    return {}


def find_group_with_name(api_client, name):
    all_groups = get_groups(api_client)
    for group in all_groups:
        if group['name'] == name:
            return group
    return {}


def find_course_with_name(api_client, name):
    all_courses = get_courses(api_client)
    for course in all_courses:
        if course['name'] == name:
            return course
    return {}


def get_clients(api_client):
    all_clients_resp = api_client.get(api_url("/clients/"))
    assert all_clients_resp.status_code == status.HTTP_200_OK
    return json.loads(all_clients_resp.content)


def get_groups(api_client):
    all_groups_resp = api_client.get(api_url("/groups/"))
    assert all_groups_resp.status_code == status.HTTP_200_OK
    return json.loads(all_groups_resp.content)


def get_courses(api_client):
    all_courses_resp = api_client.get(api_url("/courses/"))
    assert all_courses_resp.status_code == status.HTTP_200_OK
    return json.loads(all_courses_resp.content)
