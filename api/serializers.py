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


class AttendanceStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceState
        fields = '__all__'


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'


class LectureSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Lecture
        fields = '__all__'


class AttendanceSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'


class MemberOfSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = MemberOf
        fields = '__all__'
