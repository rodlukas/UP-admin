from distutils.util import strtobool
from django.utils.dateparse import parse_datetime
from datetime import datetime
from django.utils.timezone import make_aware


def to_bool(string):
    return bool(strtobool(string))


def shrink_str(phone):
    return phone.replace(" ", "")


def client_full_name(name, surname):
    return f"{surname} {name}"


def filter_empty_strings_from_list(src_list):
    return list(filter(None, src_list))


def parse_django_datetime(datetime):
    return parse_datetime(datetime)


def prepare_start(date, time):
    return make_aware(datetime.strptime(f"{date} {time}", '%Y-%m-%d %H:%M'))
