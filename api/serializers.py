from admin.models import *
from rest_framework import serializers


class CourseFlatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'


class GroupFlatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = 'id', 'name'


class AttendanceStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceState
        fields = '__all__'


class LectureForClientSerializer(serializers.ModelSerializer):
    course = CourseFlatSerializer()
    group = GroupFlatSerializer()

    class Meta:
        model = Lecture
        fields = '__all__'


class ClientFlatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'


class AttendanceForClientSerializer(serializers.ModelSerializer):
    attendancestate = AttendanceStateSerializer()
    lecture = LectureForClientSerializer()

    class Meta:
        model = Attendance
        fields = 'id', 'paid', 'note', 'lecture', 'attendancestate'


class ClientSerializer(serializers.ModelSerializer):
    attendances = AttendanceForClientSerializer(many=True)

    class Meta:
        model = Client
        fields = '__all__'


class AttendanceForLectureSerializer(serializers.ModelSerializer):
    attendancestate = AttendanceStateSerializer()
    client = ClientFlatSerializer()

    class Meta:
        model = Attendance
        fields = 'id', 'paid', 'note', 'client', 'attendancestate'


class LectureSerializer(serializers.ModelSerializer):
    attendances = AttendanceForLectureSerializer(many=True)
    course = CourseFlatSerializer()
    group = GroupFlatSerializer()

    class Meta:
        model = Lecture
        fields = '__all__'
