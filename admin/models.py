from django.core.validators import RegexValidator
from django.db import models


class AttendanceState(models.Model):
    """
    Stav účasti klienta na lekci.
    Navázán ke klientovi a lekci prostřednictvím účasti (Attendance).
    MAZÁNÍ: Stav účasti lze smazat pouze pokud není používán v žádné účasti (Attendance).
    """

    default = models.BooleanField(
        default=False, help_text="Označuje stav (právě jeden), který je výchozí"
    )  # metoda save() osetruje, aby bylo jen jedno True v DB
    excused = models.BooleanField(
        default=False, help_text="Označuje stav (právě jeden), který znamená omluven"
    )  # metoda save() osetruje, aby bylo jen jedno True v DB
    name = models.TextField(help_text="Název stavu účasti (unikátní)")
    visible = models.BooleanField(help_text="Indikátor viditelnosti stavu")

    class Meta:
        ordering = ["name"]

    def make_true_value_unique_for_attr(self, value: bool, attr: str) -> None:
        """
        Zařídí unikátnost hodnoty True (v proměnné value) pro daný atribut attr.
        """
        if value:
            # vyber ostatni polozky s attr=True
            qs = AttendanceState.objects.filter(**{attr: True})
            # krome self (pokud self existuje)
            if self.pk:
                qs = qs.exclude(pk=self.pk)
            # a nastav jim attr=False
            qs.update(**{attr: False})

    def make_all_true_values_unique(self) -> None:
        """
        Zařídí unikátnost True pro všechny potřebné boolean atributy.
        """
        self.make_true_value_unique_for_attr(self.default, "default")
        self.make_true_value_unique_for_attr(self.excused, "excused")

    def reset_attrs_when_set_non_visible(self) -> None:
        """
        Vyresetuje všechny potřebné boolean atributy když je účast neviditelná.
        """
        if not self.visible:
            self.default = self.excused = False

    def save(self, *args, **kwargs) -> None:
        self.reset_attrs_when_set_non_visible()
        self.make_all_true_values_unique()
        super().save(*args, **kwargs)


class Client(models.Model):
    """
    Klient lektorky.
    Může být zájemcem o nějaký kurz (přes Application), být členem nějaké skupiny (přes Membership).
    Může mít nějakou lekci (přes Attendance).
    OMEZENÍ: Neaktivním klientům nelze přiřadit nové lekce.
    MAZÁNÍ: Klienta lze smazat pouze pokud se neúčastní žádné lekce (prostřednictvím Attendance).
    """

    active = models.BooleanField(default=True, help_text="Indikátor aktivity klienta")
    email = models.EmailField(blank=True, help_text="Email klienta")
    firstname = models.TextField(help_text="Křestní jméno klienta")
    note = models.TextField(blank=True, help_text="Poznámka")
    phone = models.TextField(blank=True, help_text="Telefonní číslo klienta")
    surname = models.TextField(help_text="Příjmení klienta")

    class Meta:
        ordering = ["surname", "firstname"]

    def phone_transform(self) -> None:
        """
        Sjednotí formát telefonního čísla - odstraní mezery.
        """
        # odstraneni vsech mezer v telefonu
        self.phone = "".join(self.phone.split())

    def save(self, *args, **kwargs) -> None:
        self.phone_transform()
        super().save(*args, **kwargs)


class Course(models.Model):
    """
    Kurz, na který mohou klienti v rámci lekcí docházet.
    Patří ke každé lekci, má jej každá skupina a mohou k němu být (přes Application) přiřazováni zájemci.
    OMEZENÍ: K neviditelnému kurzu nelze přiřadit skupina nebo zájemce.
    MAZÁNÍ: Kurz lze smazat pouze pokud k němu neexistuje žádná lekce a není přiřazena žádná skupina.
    """

    color = models.CharField(
        max_length=7,
        default="#000000",
        validators=[
            RegexValidator(regex="^#(?:[0-9a-fA-F]{3}){1,2}$", message="Barva není v HEX formátu")
        ],
        help_text="Kód barvy kurzu",
    )  # regex viz https://stackoverflow.com/a/1636354
    duration = models.PositiveIntegerField(help_text="Trvání kurzu (min.)")
    name = models.TextField(help_text="Název kurzu (unikátní)")
    visible = models.BooleanField(help_text="Indikátor viditelnosti kurzu")

    class Meta:
        ordering = ["name"]

    def color_transform(self) -> None:
        """
        Sjednotí formát barvy - velká písmena, 6 čísel.
        """
        # prevod barvy na velka pismena
        self.color = self.color.upper()
        # barva se 3 cisly se prevede na 6 cisel
        if len(self.color) != 7:
            self.color = "#{}".format("".join(2 * c for c in self.color.lstrip("#")))

    def save(self, *args, **kwargs) -> None:
        self.color_transform()
        super().save(*args, **kwargs)


class Application(models.Model):
    """
    Reprezentuje zájem klienta o kurz.
    OMEZENÍ: Každý klient může mít zájem o daný kurz nejvýše jednou.
    """

    note = models.TextField(blank=True, help_text="Poznámka")
    client = models.ForeignKey(
        Client,
        related_name="applications",
        on_delete=models.CASCADE,
        help_text="Klient, který má zájem o kurz",
    )
    course = models.ForeignKey(
        Course,
        related_name="applications",
        on_delete=models.CASCADE,
        help_text="Kurz, o který má klient zájem",
    )
    created_at = models.DateField(auto_now_add=True, help_text="Datum vytvoření zájemce o kurz")

    class Meta:
        ordering = ["client__surname", "client__firstname"]


class Group(models.Model):
    """
    Skupina klientů nějakého kurzu.
    Patří k ní její lekce, členové (prostřednictvím Membership).
    OMEZENÍ: Neaktivním skupinám nelze přiřadit nové lekce.
    """

    active = models.BooleanField(default=True, help_text="Indikátor aktivity skupiny")
    name = models.TextField(help_text="Název skupiny (unikátní)")
    course = models.ForeignKey(Course, on_delete=models.PROTECT, help_text="Kurz skupiny")

    class Meta:
        ordering = ["name"]


class Lecture(models.Model):
    """
    Konkrétní lekce klienta či skupiny náležící nějakému kurzu.
    Účastníci lekce jsou navázáni k lekci prostřednictvím svých účastí (Attendance).
    V případě skupinové lekce se k lekci váže i příslušná skupina.
    OMEZENÍ: Neskupinová lekce má jen jednoho účastníka.
    OMEZENÍ: Kurz skupiny musí být tentýž jako kurz příslušné lekce.
    OMEZENÍ: Nezrušené lekce nesmí být vzhledem ke startu a trvání v časovém konfliktu.
    AUTOMATICKY: Pro lekce s alespoň 1 účastníkem, kde jsou všichni omluveni, nastaví lekci jako zrušenou.
    """

    canceled = models.BooleanField(help_text="Indikátor zrušení lekce ze strany lektorky")
    duration = models.PositiveIntegerField(help_text="Trvání lekce (min.)")
    start = models.DateTimeField(
        null=True, help_text="Datum a čas začátku lekce, prázdné pro předplacené lekce bez termínu"
    )
    course = models.ForeignKey(
        Course, on_delete=models.PROTECT, help_text="Kurz, ke kterému patří lekce"
    )
    group = models.ForeignKey(
        Group,
        related_name="lectures",
        on_delete=models.CASCADE,
        null=True,
        help_text="Skupina, které se tato lekce týká (v případě skupinové lekce)",
    )


class Attendance(models.Model):
    """
    Reprezentace účasti klienta na nějaké lekci.
    Váže se k nějaké lekci.
    OMEZENÍ: U předplacených lekcí nelze platba měnit a musí být u všech účastníků zaplaceno.
    """

    note = models.TextField(blank=True, help_text="Poznámka")
    paid = models.BooleanField(help_text="Indikátor zaplacené lekce")
    client = models.ForeignKey(
        Client,
        related_name="attendances",
        on_delete=models.PROTECT,
        help_text="Klient, který se účastní dané lekce",
    )  # on_delete: tedy lze smazat pouze klienta co nema zadne attendances
    lecture = models.ForeignKey(
        Lecture,
        related_name="attendances",
        on_delete=models.CASCADE,
        help_text="Lekce, ke které tato účast náleží",
    )
    attendancestate = models.ForeignKey(
        AttendanceState,
        on_delete=models.PROTECT,
        help_text="Stav účasti daného klienta na dané lekci",
    )

    class Meta:
        ordering = ["client__surname", "client__firstname"]


class Membership(models.Model):
    """
    Reprezentuje členství klienta ve skupině.
    AUTOMATICKY: Provádí se korekce počtu předplacených lekcí (viz AttendanceSerializer, LectureSerializer).
    """

    prepaid_cnt = models.PositiveIntegerField(
        default=0, help_text="Počet předplacených lekcí klienta v rámci dané skupiny"
    )
    client = models.ForeignKey(
        Client,
        related_name="memberships",
        on_delete=models.CASCADE,
        help_text="Klient, který je členem dané skupiny",
    )
    group = models.ForeignKey(
        Group,
        related_name="memberships",
        on_delete=models.CASCADE,
        help_text="Skupina, jejímž členem je daný klient",
    )

    class Meta:
        ordering = ["client__surname", "client__firstname"]
