from rest_framework import serializers


def validate_course_is_visible(course):
    """
    overi, ze zaslany kurz je viditelny, jinak vyhodi vyjimku
    """
    if not course.visible:
        raise serializers.ValidationError("Zadaný kurz není viditelný.")
    return course
