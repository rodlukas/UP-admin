from datetime import datetime
from distutils.util import strtobool

from django.utils.dateparse import parse_datetime
from django.utils.timezone import make_aware

from admin.models import AttendanceState


def get_excused_attendancestate():
    return AttendanceState.objects.get(excused=True).name


def to_bool(string):
    return bool(strtobool(string))


def shrink_str(phone):
    return phone.replace(" ", "")


def color_transform(color):
    color = color.upper()
    if len(color) != 7:
        color = "#{}".format("".join(2 * c for c in color.lstrip("#")))
    return color


def client_full_name(name, surname):
    return f"{surname} {name}"


def filter_empty_strings_from_list(src_list):
    return list(filter(None, src_list))


def parse_django_datetime(datetime_str):
    return parse_datetime(datetime_str)


def prepare_start(date, time):
    return make_aware(datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M"))
