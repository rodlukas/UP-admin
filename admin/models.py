from django.db import models


class AttendanceState(models.Model):
    name = models.TextField()
    visible = models.BooleanField()
    default = models.BooleanField(default=False)    # metoda save() osetruje, aby bylo jen jedno True v DB
    excused = models.BooleanField(default=False)    # metoda save() osetruje, aby bylo jen jedno True v DB

    class Meta:
        ordering = ['name']

    # zaridi unikatnost True pro atributy default, excused
    def save(self, *args, **kwargs):
        if self.default:
            # vyber ostatni polozky s default=True
            qs = AttendanceState.objects.filter(default=True)
            # krome self (pokud self existuje)
            if self.pk:
                qs = qs.exclude(pk=self.pk)
            # a nastav jim default=False
            qs.update(default=False)
            # pokud se stav nastavuje na neviditelny, vyresetuj volbu vychoziho stavu
            if self.visible is False:
                self.default = False
        if self.excused:
            # vyber ostatni polozky s excused=True
            qs = AttendanceState.objects.filter(excused=True)
            # krome self (pokud self existuje)
            if self.pk:
                qs = qs.exclude(pk=self.pk)
            # a nastav jim excused=False
            qs.update(excused=False)
        super().save(*args, **kwargs)


class Client(models.Model):
    name = models.TextField()
    surname = models.TextField()
    phone = models.TextField(blank=True)
    email = models.EmailField(blank=True)
    note = models.TextField(blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ['surname', 'name']

    def save(self, *args, **kwargs):
        # odstraneni vsech mezer v telefonu
        self.phone = "".join(self.phone.split())
        super().save(*args, **kwargs)


class Course(models.Model):
    name = models.TextField()
    visible = models.BooleanField()
    duration = models.PositiveIntegerField()

    class Meta:
        ordering = ['name']


class Application(models.Model):
    note = models.TextField(blank=True)
    client = models.ForeignKey(Client, related_name='applications', on_delete=models.CASCADE)
    course = models.ForeignKey(Course, related_name='applications', on_delete=models.CASCADE)

    class Meta:
        ordering = ['client__surname', 'client__name']


class Group(models.Model):
    name = models.TextField()
    course = models.ForeignKey(Course, on_delete=models.PROTECT)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']


class Lecture(models.Model):
    start = models.DateTimeField(null=True)
    canceled = models.BooleanField()
    duration = models.PositiveIntegerField()
    course = models.ForeignKey(Course, on_delete=models.PROTECT)
    group = models.ForeignKey(Group, related_name='lectures', on_delete=models.CASCADE, null=True)


class Attendance(models.Model):
    paid = models.BooleanField()
    note = models.TextField(blank=True)
    # on_delete: tedy lze smazat pouze klienta co nema zadne attendances
    client = models.ForeignKey(Client, related_name='attendances', on_delete=models.PROTECT)
    lecture = models.ForeignKey(Lecture, related_name='attendances', on_delete=models.CASCADE)
    attendancestate = models.ForeignKey(AttendanceState, on_delete=models.PROTECT)

    class Meta:
        ordering = ['client__surname', 'client__name']


class Membership(models.Model):
    prepaid_cnt = models.PositiveIntegerField(default=0)
    client = models.ForeignKey(Client, related_name='memberships', on_delete=models.CASCADE)
    group = models.ForeignKey(Group, related_name='memberships', on_delete=models.CASCADE)

    class Meta:
        ordering = ['client__surname', 'client__name']
