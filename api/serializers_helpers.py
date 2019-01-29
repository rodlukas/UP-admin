from rest_framework import serializers
from django.utils import timezone


def validate_course_is_visible(course):
    """
    overi, ze zaslany kurz je viditelny, jinak vyhodi vyjimku
    """
    if not course.visible:
        raise serializers.ValidationError("Zadaný kurz není viditelný.")
    return course


def datetime_zone(datetime):
    # prevod na spravnou TZ
    return timezone.localtime(datetime)


def datetime_str(datetime):
    datetime = datetime_zone(datetime)
    return f"{datetime.day}. {datetime.month}. {datetime.year} – {datetime.hour}:{datetime.minute:02}"


def date_str(datetime):
    datetime = datetime_zone(datetime)
    return f"{datetime.day}. {datetime.month}. {datetime.year}"
