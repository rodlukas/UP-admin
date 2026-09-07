"""
Generátor mockových dat pro lokální vývoj a ladění UI.

Proč vedle `scripts/sql/sample_data.pgsql`: ten je záměrně malý onboarding vzorek
(5 klientů, 24 lekcí s termíny z let 2019–2020) a je součástí repozitáře i obrazu
databáze. Na procházení a ladění UI ale nestačí — diář i přehled jsou s ním prázdné.
Tenhle příkaz proto **přidává** hodně dat s termíny kolem dneška; nic nemaže.

Respektuje omezení aplikace:
- nezrušené lekce nesmí být v časovém konfliktu → rozvrh je globálně bez překryvů,
- neskupinová lekce má právě jednoho účastníka,
- kurz skupiny musí být tentýž jako kurz lekce,
- předplacená lekce (`start=None`) má u všech účastí `paid=True`,
- lekce, kde jsou všichni omluveni, je zrušená.
"""

import datetime
import random
from typing import Any

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError, CommandParser
from django.db import transaction
from django.utils import timezone

from admin.models import (
    Application,
    Attendance,
    AttendanceState,
    Client,
    Course,
    Group,
    Lecture,
    Membership,
)

FIRST_NAMES_M = [
    "Jakub", "Jan", "Tomáš", "Adam", "Matěj", "Filip", "Vojtěch", "Ondřej", "David", "Lukáš",
    "Martin", "Petr", "Daniel", "Šimon", "Marek", "Štěpán", "Josef", "Michal", "Antonín", "Václav",
]
FIRST_NAMES_F = [
    "Eliška", "Anna", "Tereza", "Adéla", "Natálie", "Karolína", "Kristýna", "Barbora", "Klára",
    "Veronika", "Nikola", "Sofie", "Ema", "Julie", "Viktorie", "Michaela", "Lucie", "Alena",
    "Markéta", "Zuzana",
]
SURNAMES = [
    "Novák", "Svoboda", "Novotný", "Dvořák", "Černý", "Procházka", "Kučera", "Veselý", "Horák",
    "Němec", "Marek", "Pospíšil", "Pokorný", "Hájek", "Král", "Jelínek", "Růžička", "Beneš",
    "Fiala", "Sedláček", "Doležal", "Zeman", "Kolář", "Navrátil", "Čermák", "Vaněk", "Urban",
    "Blažek", "Kříž", "Kovář", "Bartoš", "Vlček", "Polák", "Musil", "Štěpánek", "Holub",
    "Konečný", "Malý", "Šimek", "Moravec",
]
CLIENT_NOTES = [
    "doporučení od pediatra", "grafomotorika", "nástup do školy 2027", "sourozenec dochází také",
    "leváctví", "doporučení z PPP", "odklad školní docházky", "logopedie souběžně",
    "maminka volá až odpoledne", "platí vždy převodem", "", "", "", "", "", "",
]
ATTENDANCE_NOTES = [
    "půjčen bzučák", "domácí úkol splněn", "unavený", "přišel pozdě", "výborná spolupráce",
    "půjčen pracovní sešit", "bez domácí přípravy", "", "", "", "", "", "", "",
]
APPLICATION_NOTES = [
    "od září", "ozve se v lednu", "čeká na termín", "prosí o dopolední termín",
    "sourozenec už dochází", "zatím jen zájem, potvrdí", "",
]
NEW_COURSES = [
    ("Bilaterální integrace", 45, "#2F6F8F"),
    ("Deficity dílčích funkcí", 40, "#7A5AA8"),
    ("Logopedická prevence", 30, "#1F8A70"),
    ("Příprava na školu", 60, "#B4531F"),
    ("Feuerstein — pokročilí", 45, "#8E44AD"),
]
NEW_GROUP_NAMES = [
    "Slabikáři A", "Slabikáři B", "Předškoláci úterý", "Předškoláci čtvrtek",
    "Grafomotorika malí", "Grafomotorika velcí", "RoPraTem ranní", "RoPraTem odpolední",
    "Feuerstein začátečníci", "Feuerstein pokročilí", "Bilaterální A", "Logo skupinka",
]
DIACRITICS = str.maketrans(
    "áčďéěíňóřšťúůýž", "acdeeinorstuuyz"
)


def to_female_surname(surname: str) -> str:
    """Hrubé přechýlení příjmení do ženského tvaru — pro mock data to stačí."""
    if surname.endswith("ý"):
        return surname[:-1] + "á"
    if surname.endswith("ek") or surname.endswith("ěk"):
        return surname[:-2] + "ková"
    return surname + "ová"


class Command(BaseCommand):
    help = "Naplní databázi mockovými daty pro procházení a ladění UI (nic nemaže)."

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument("--clients", type=int, default=70, help="Kolik klientů přidat")
        parser.add_argument("--days-back", type=int, default=200, help="Historie lekcí (dny)")
        parser.add_argument("--days-ahead", type=int, default=35, help="Budoucnost lekcí (dny)")
        parser.add_argument("--seed", type=int, default=20260905, help="Seed pro opakovatelnost")

    @staticmethod
    def _require_attendance_states() -> tuple[AttendanceState, AttendanceState]:
        """
        Vrátí výchozí a omluvený stav účasti, nebo skončí srozumitelnou chybou.

        Volá se **před prvním zápisem**: bez těch dvou stavů se generování lekcí neobejde
        a syrový `DoesNotExist` uprostřed atomického bloku by neřekl, že chybí vzorek
        ze `scripts/sql/sample_data.pgsql` — tedy přesně na čerstvé databázi, na kterou
        tenhle příkaz míří.
        """
        hint = "Naplň nejdřív databázi vzorkem: scripts/sql/sample_data.pgsql"
        states = {}
        for flag, label in (("default", "výchozí"), ("excused", "omluvený")):
            found = list(AttendanceState.objects.filter(**{flag: True}))
            if not found:
                raise CommandError(f"V databázi není {label} stav účasti ({flag}=True). {hint}")
            if len(found) > 1:
                raise CommandError(
                    f"V databázi je {label} stav účasti ({flag}=True) vícekrát "
                    f"({len(found)}×) — oprav data v Nastavení."
                )
            states[flag] = found[0]
        return states["default"], states["excused"]

    @transaction.atomic
    def handle(self, *args: Any, **options: Any) -> None:
        # `DEPLOYED` samo o sobě nestačí: nastavuje ho i `docker-compose.yml` (celý lokální
        # vývoj v kontejnerech, `DJANGO_SETTINGS_MODULE=up.settings.local`,
        # `MANUAL_PRODUCTION=False`) — tenhle běh je pořád na vlastním lokálním Postgresu,
        # ne na nasazené instanci. Rozhoduje proto modul nastavení, ne `DEPLOYED`:
        # skutečně nasazená instance i lokální simulace produkční verze (`.env.template`)
        # obě běží na `up.settings.production`, ale jen ta nasazená má `MANUAL_PRODUCTION`
        # nenastavené (viz up/settings/production.py) — jen tahle kombinace se má odmítnout,
        # protože naseedovaná data by tam byla od skutečných nerozeznatelná (viz docstring
        # modulu).
        if settings.SETTINGS_MODULE == "up.settings.production" and not settings.MANUAL_PRODUCTION:
            raise CommandError(
                "seed_mock_data je jen pro lokální vývoj — na nasazené instanci "
                "(up.settings.production, MANUAL_PRODUCTION=False) se nesmí spouštět."
            )
        random.seed(options["seed"])
        # `timezone.localdate()`, ne `datetime.date.today()`: appka bezi v Europe/Prague
        # (`TIME_ZONE` v base.py), zatimco kontejner (python:3.12-slim) bez ENV TZ bezi
        # v UTC - kolem pulnoci by se jinak seedovalo na spatny kalendarni den.
        today = timezone.localdate()

        attendance_states = self._require_attendance_states()

        courses = self._create_courses()
        clients = self._create_clients(int(options["clients"]))
        active_clients = [client for client in clients if client.active]
        if not active_clients:
            self.stderr.write("V databázi nejsou aktivní klienti, nelze generovat lekce.")
            return

        groups = self._create_groups(courses, active_clients)
        self._create_applications(clients, courses, today)
        self._create_lectures(
            courses=courses,
            groups=groups,
            active_clients=active_clients,
            today=today,
            days_back=int(options["days_back"]),
            days_ahead=int(options["days_ahead"]),
            attendance_states=attendance_states,
        )
        self._report(today)

    def _create_courses(self) -> list[Course]:
        for name, duration, color in NEW_COURSES:
            Course.objects.get_or_create(
                name=name, defaults={"duration": duration, "color": color, "visible": True}
            )
        # rozvrh staví jen na viditelných kurzech (k neviditelnému nelze přiřadit skupinu)
        return list(Course.objects.filter(visible=True))

    def _create_clients(self, count: int) -> list[Client]:
        taken = set(Client.objects.values_list("firstname", "surname"))
        new_clients: list[Client] = []
        # pojistka proti nekonečné smyčce, když dojdou kombinace jmen
        for _ in range(count * 50):
            if len(new_clients) >= count:
                break
            is_female = random.random() < 0.5
            firstname = random.choice(FIRST_NAMES_F if is_female else FIRST_NAMES_M)
            surname = random.choice(SURNAMES)
            if is_female:
                surname = to_female_surname(surname)
            if (firstname, surname) in taken:
                continue
            taken.add((firstname, surname))
            mail_local = f"{firstname}.{surname}".lower().translate(DIACRITICS)
            new_clients.append(
                Client(
                    firstname=firstname,
                    surname=surname,
                    active=random.random() < 0.85,
                    phone=self._random_phone() if random.random() < 0.8 else "",
                    email=f"{mail_local}@example.cz" if random.random() < 0.55 else "",
                    note=random.choice(CLIENT_NOTES),
                )
            )
        Client.objects.bulk_create(new_clients)
        return list(Client.objects.all())

    def _random_phone(self) -> str:
        # Bez mezer: `prettyPhone` ve frontendu krájí řetězec po třech znacích a `tel:`
        # odkaz ho používá tak, jak je — mezery by rozbily zobrazení i vytáčení.
        prefix = random.choice([602, 603, 604, 605, 606, 702, 703, 720, 721, 722, 724])
        return f"{prefix}{random.randint(100, 999)}{random.randint(100, 999)}"

    def _create_groups(self, courses: list[Course], active_clients: list[Client]) -> list[Group]:
        for name in NEW_GROUP_NAMES:
            group, was_created = Group.objects.get_or_create(
                name=name,
                defaults={"course": random.choice(courses), "active": random.random() < 0.8},
            )
            if not was_created:
                continue
            for client in random.sample(active_clients, min(random.randint(3, 6), len(active_clients))):
                Membership.objects.get_or_create(
                    client=client,
                    group=group,
                    defaults={"prepaid_cnt": random.choice([0, 0, 0, 0, 2, 5, 10])},
                )
        # lekce plánujeme jen aktivním skupinám (neaktivní nesmí dostat novou lekci)
        return list(Group.objects.select_related("course").filter(active=True))

    def _create_applications(
        self, clients: list[Client], courses: list[Course], today: datetime.date
    ) -> None:
        taken = set(Application.objects.values_list("client_id", "course_id"))
        for _ in range(24):
            client = random.choice(clients)
            course = random.choice(courses)
            if (client.pk, course.pk) in taken:
                continue
            taken.add((client.pk, course.pk))
            application = Application.objects.create(
                client=client, course=course, note=random.choice(APPLICATION_NOTES)
            )
            # `created_at` je auto_now_add, na vytvoření ho nastavit nejde — rozprostřeme
            # ho zpětně přes .update(), ať zájemci nejsou všichni z dneška
            Application.objects.filter(pk=application.pk).update(
                created_at=today - datetime.timedelta(days=random.randint(3, 420))
            )

    def _create_lectures(
        self,
        courses: list[Course],
        groups: list[Group],
        active_clients: list[Client],
        today: datetime.date,
        days_back: int,
        days_ahead: int,
        attendance_states: tuple[AttendanceState, AttendanceState],
    ) -> None:
        default_state, excused_state = attendance_states
        other_states = list(
            AttendanceState.objects.filter(visible=True).exclude(
                pk__in=[default_state.pk, excused_state.pk]
            )
        )
        # „stálí" klienti chodí častěji, aby karty klientů a žebříčky měly co ukázat
        regulars = random.sample(active_clients, min(28, len(active_clients)))

        # Obsazené intervaly už existujících lekcí. Bez nich by se nově generovaný rozvrh
        # mohl s daty v databázi překrýt a aplikace by pak odmítla takovou lekci uložit
        # (nezrušené lekce nesmí být v časovém konfliktu).
        busy: dict[datetime.date, list[tuple[datetime.datetime, datetime.datetime]]] = {}
        for start, duration in Lecture.objects.filter(
            canceled=False, start__isnull=False
        ).values_list("start", "duration"):
            local_start = timezone.localtime(start).replace(tzinfo=None)
            local_end = local_start + datetime.timedelta(minutes=duration)
            busy.setdefault(local_start.date(), []).append((local_start, local_end))

        planned: list[tuple[Lecture, list[Attendance]]] = []
        day = today - datetime.timedelta(days=days_back)
        last_day = today + datetime.timedelta(days=days_ahead)

        while day <= last_day:
            weekday = day.weekday()  # 0 = pondělí, 6 = neděle
            if weekday == 6:
                day += datetime.timedelta(days=1)
                continue

            if day == today:
                lectures_today = 6  # dnešek vždy naplněný, ať Přehled něco ukáže
            elif weekday == 5:
                lectures_today = random.choice([0, 0, 2, 3, 4])
            else:
                lectures_today = random.choice([0, 3, 4, 5, 6, 7, 8, 8, 9])

            cursor = datetime.datetime.combine(day, datetime.time(9 if weekday == 5 else 8, 0))
            day_end = datetime.datetime.combine(day, datetime.time(19, 0))

            for _ in range(lectures_today):
                group = random.choice(groups) if groups and random.random() < 0.4 else None
                course = group.course if group is not None else random.choice(courses)

                slot_start = self._find_free_slot(
                    busy.get(day, []), cursor, course.duration, day_end
                )
                if slot_start is None:
                    break
                cursor = slot_start

                participants = self._pick_participants(group, regulars, active_clients, day > today)
                if not participants:
                    continue

                lecture, attendances = self._build_lecture(
                    course=course,
                    group=group,
                    start=timezone.make_aware(cursor),
                    participants=participants,
                    is_future=day > today,
                    default_state=default_state,
                    excused_state=excused_state,
                    other_states=other_states,
                )
                planned.append((lecture, attendances))
                busy.setdefault(day, []).append(
                    (cursor, cursor + datetime.timedelta(minutes=course.duration))
                )
                cursor += datetime.timedelta(
                    minutes=course.duration + random.choice([5, 10, 10, 15, 20, 30])
                )

            day += datetime.timedelta(days=1)

        # předplacené lekce bez termínu — u nich musí být zaplaceno u všech účastí
        for client in random.sample(regulars, min(10, len(regulars))):
            course = random.choice(courses)
            lecture = Lecture(
                course=course, group=None, start=None, duration=course.duration, canceled=False
            )
            planned.append(
                (
                    lecture,
                    [Attendance(client=client, attendancestate=default_state, paid=True, note="")],
                )
            )

        Lecture.objects.bulk_create([lecture for lecture, _ in planned])
        rows: list[Attendance] = []
        for lecture, attendances in planned:
            for attendance in attendances:
                attendance.lecture = lecture
                rows.append(attendance)
        Attendance.objects.bulk_create(rows, batch_size=1000)

    def _find_free_slot(
        self,
        busy_intervals: list[tuple[datetime.datetime, datetime.datetime]],
        cursor: datetime.datetime,
        duration: int,
        day_end: datetime.datetime,
    ) -> datetime.datetime | None:
        """
        Najde nejbližší volný začátek od `cursor`, který se nekryje s žádným obsazeným
        intervalem dne. Vrací `None`, když se lekce do konce dne už nevejde.
        """
        candidate = cursor
        # každý posun může narazit na další interval, proto smyčka přes jejich počet
        for _ in range(len(busy_intervals) + 1):
            candidate_end = candidate + datetime.timedelta(minutes=duration)
            if candidate_end > day_end:
                return None
            conflict = next(
                (
                    interval
                    for interval in busy_intervals
                    if candidate < interval[1] and interval[0] < candidate_end
                ),
                None,
            )
            if conflict is None:
                return candidate
            candidate = conflict[1] + datetime.timedelta(minutes=random.choice([5, 10, 15]))
        return None

    def _pick_participants(
        self,
        group: Group | None,
        regulars: list[Client],
        active_clients: list[Client],
        is_future: bool,
    ) -> list[Client]:
        if group is not None:
            members = [
                membership.client for membership in group.memberships.select_related("client")
            ]
            if is_future:
                # Neaktivnímu klientovi nelze přiřadit novou lekci. Platí to i pro skupiny:
                # existující skupiny mohou mít neaktivní členy a `bulk_create` níže zapisuje
                # bez validace, takže by tu vznikly lekce, které aplikace sama odmítne uložit.
                members = [client for client in members if client.active]
            if not members:
                return []
            return random.sample(members, random.randint(1, len(members)))
        pool = regulars if random.random() < 0.75 else active_clients
        if is_future:
            pool = [client for client in pool if client.active] or active_clients
        return [random.choice(pool)]

    def _build_lecture(
        self,
        course: Course,
        group: Group | None,
        start: datetime.datetime,
        participants: list[Client],
        is_future: bool,
        default_state: AttendanceState,
        excused_state: AttendanceState,
        other_states: list[AttendanceState],
    ) -> tuple[Lecture, list[Attendance]]:
        canceled = random.random() < (0.04 if is_future else 0.09)
        attendances: list[Attendance] = []
        for client in participants:
            state = self._pick_state(is_future, default_state, excused_state, other_states)
            attendances.append(
                Attendance(
                    client=client,
                    attendancestate=state,
                    paid=random.random() < (0.45 if is_future else 0.88),
                    note=random.choice(ATTENDANCE_NOTES),
                )
            )
        # aplikace sama ruší lekci, kde jsou všichni omluveni — držíme data konzistentní
        if all(attendance.attendancestate_id == excused_state.pk for attendance in attendances):
            canceled = True
        lecture = Lecture(
            course=course,
            group=group,
            start=start,
            duration=course.duration,
            canceled=canceled,
        )
        return lecture, attendances

    def _pick_state(
        self,
        is_future: bool,
        default_state: AttendanceState,
        excused_state: AttendanceState,
        other_states: list[AttendanceState],
    ) -> AttendanceState:
        if is_future:
            return default_state
        roll = random.random()
        if roll < 0.80:
            return default_state
        if roll < 0.90:
            return excused_state
        return random.choice(other_states) if other_states else default_state

    def _report(self, today: datetime.date) -> None:
        self.stdout.write(self.style.SUCCESS("Mocková data vygenerována."))
        for label, value in (
            ("klienti", Client.objects.count()),
            ("kurzy", Course.objects.count()),
            ("skupiny", Group.objects.count()),
            ("zájemci", Application.objects.count()),
            ("lekce", Lecture.objects.count()),
            ("  z toho dnes", Lecture.objects.filter(start__date=today).count()),
            ("  z toho předplacené", Lecture.objects.filter(start__isnull=True).count()),
            ("účasti", Attendance.objects.count()),
        ):
            self.stdout.write(f"  {label:<22} {value}")
