from admin.models import Attendance, AttendanceState, Lecture
from rest_framework import serializers
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.settings import api_settings


def validate_course_is_visible(course):
    """
    overi, ze zaslany kurz je viditelny, jinak vyhodi vyjimku
    """
    if not course.visible:
        raise serializers.ValidationError("Zadaný kurz není viditelný.")
    return course


def validate_client_is_active(client):
    """
    overi, ze zaslany klient je aktivni, jinak vyhodi vyjimku
    """
    if not client.active:
        raise serializers.ValidationError(
            f"Zadaný klient ({client.surname} {client.name}) není aktivní, pro další akce je potřeba nastavit jej jako aktivního.")
    return client


def validate_group_is_active(group):
    """
    overi, ze zaslana skupina je aktivni, jinak vyhodi vyjimku
    """
    if not group.active:
        raise serializers.ValidationError(
            "Zadaná skupina není aktivní, pro další akce je potřeba nastavit ji jako aktivní.")
    return group


def datetime_zone(datetime):
    # prevod na spravnou TZ
    return timezone.localtime(datetime)


def datetime_str(datetime):
    datetime = datetime_zone(datetime)
    return f"{datetime.day}. {datetime.month}. {datetime.year} – {datetime.hour}:{datetime.minute:02}"


def date_str(datetime):
    datetime = datetime_zone(datetime)
    return f"{datetime.day}. {datetime.month}. {datetime.year}"


def should_be_canceled(attendances):
    # zaridi, ze lekce bude zrusena pokud jsou vsichni omluveni
    client_cnt = len(attendances)
    # lekce bez ucastniku neni oznacena jako zrusena
    if client_cnt == 0:
        return False
    excused_cnt = 0
    for attendance in attendances:
        # muze prijit queryset i slovnik
        # pokud attendancestate znamena omluven, pricti jednicku k poctu omluvenych
        if ((type(attendance) != Attendance and attendance['attendancestate'].excused) or
                (type(attendance) == Attendance and attendance.attendancestate.excused)):
            excused_cnt += 1
    return client_cnt == excused_cnt


def lecture_corrections(lecture, attendance, prev_canceled, prev_attendancestate):
    # kdyz se zmenil stav ucasti na OMLUVEN a ma zaplaceno
    # NEBO pokud se lekce prave RUCNE zrusila, ale mel dorazit a ma zaplaceno, pricti mu jednu lekci
    if (attendance.attendancestate.excused and not prev_attendancestate.excused and attendance.paid) \
            or (not prev_canceled and lecture.canceled
                and attendance.attendancestate.default and attendance.paid):
        if lecture.group is not None:
            # najdi clenstvi nalezici klientovi v teto skupine
            try:
                membership = lecture.group.memberships.get(client=attendance.client)
            except ObjectDoesNotExist:
                # pokud uz klient neni clenem skupiny, nic nedelej
                pass
            else:
                membership.prepaid_cnt = membership.prepaid_cnt + 1
                membership.save()
        else:
            prepaid_lecture = Lecture.objects.create(course=lecture.course, duration=lecture.course.duration,
                                                     canceled=False)
            Attendance.objects.create(paid=True, client=attendance.client, lecture=prepaid_lecture,
                                      attendancestate=AttendanceState.objects.get(default=True),
                                      note=f"Náhrada lekce ({date_str(lecture.start)})")


def lecture_cancellability(lecture):
    # Django neupdatuje pres refresh_from_db relational fields, je tedy potreba nacist znovu
    lecture = Lecture.objects.get(pk=lecture.pk)
    # nastav lekci jako zrusenou pokud nikdo nema prijit
    if not lecture.canceled:
        lecture.canceled = should_be_canceled(lecture.attendances.all())
        lecture.save()


def validate_prepaid_non_changable_paid_state(attendance):
    if 'paid' in attendance and not attendance['paid']:
        raise serializers.ValidationError(
            {api_settings.NON_FIELD_ERRORS_KEY: "U předplacené lekce nelze měnit parametry platby"})
