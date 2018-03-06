from admin.models import *
from rest_framework import serializers


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = '__all__'


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'


class LectureSerializer(serializers.ModelSerializer):
    attendances = AttendanceSerializer(many=True)
    course = CourseSerializer()
    group = GroupSerializer()

    class Meta:
        model = Lecture
        fields = '__all__'
