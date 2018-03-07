from admin.models import *
from rest_framework import serializers
import json


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'


#class MemberOfSerializer(serializers.ModelSerializer):
#    class Meta:
#        model = MemberOf
#        fields = '__all__'


class GroupSerializer(serializers.ModelSerializer):
    #memberof = MemberOfSerializer(many=True)

    class Meta:
        model = Group
        fields = '__all__'


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'


class AttendanceStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceState
        fields = '__all__'


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        exclude = 'lecture',


class LectureSerializer(serializers.ModelSerializer):
    attendances = AttendanceSerializer(many=True)

    class Meta:
        model = Lecture
        fields = '__all__'

    def create(self, validated_data):
        for k, v in validated_data.items():
            print(k, v)
        attendances_data = validated_data.pop('attendances')
        course = Course.objects.get(pk=validated_data.pop('course').id)
        #for k, v in validated_data.items():
        #    print(k, v)
        group = Group.objects.get(pk=validated_data.pop('group').id)
        instance = Lecture.objects.create(course=course, group=group, **validated_data)
        for attendance_data in attendances_data:
            client = Client.objects.get(pk=attendance_data.pop('client').id)
            Attendance.objects.create(client=client, lecture=instance, **attendance_data)
        return instance
