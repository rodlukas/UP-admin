import { Model, PatchType } from "./types"

/* *************************************************************************************************
Modely pro GET požadavky na API.

Reprezentují data tak, jak je obdržíme z API.
Respektují způsoby vnoření dat a všechny možnosti API.
************************************************************************************************* */

/** Klient (GET). */
export type ClientType = Model & {
    active: boolean
    email: string
    note: string
    phone: string
    firstname: string
    surname: string
    last_lecture_date: string | null
}

/** Aktivní klient (GET). */
export type ClientActiveType = ClientType & {
    normalized: string[]
}

/** Kurz (GET). */
export type CourseType = Model & {
    name: string
    color: string
    duration: number
    visible: boolean
}

/** Členství (GET). */
export type MembershipType = Model & {
    prepaid_cnt: number
    client: ClientType
}

/** Zájemce o kurz (GET). */
export type ApplicationType = Model & {
    note: string
    created_at: string
    client: ClientType
    course: CourseType
}

/** Lekce (GET) - jen nepředplacená. */
export type LectureTypeWithDate = LectureType & {
    start: string
}

/** Lekce (GET) - předplacená i nepředplacená. */
export type LectureType = Model & {
    course: CourseType
    start: string | null
    group: null | GroupType
    number: number
    canceled: boolean
    duration: number
    attendances: AttendanceType[]
}

/** Účast na lekci (GET). */
export type AttendanceType = Model & {
    client: ClientType
    remind_pay: boolean
    note: string
    paid: boolean
    number?: number
    // !! bez vnoreni
    attendancestate: AttendanceStateType["id"]
}

/** Skupina (GET). */
export type GroupType = Model & {
    name: string
    memberships: MembershipType[]
    active: boolean
    course: CourseType
    last_lecture_date: string | null
}

/** Stav účasti (GET). */
export type AttendanceStateType = Model & {
    name: string
    visible: boolean
    default?: boolean
    excused?: boolean
}

/**
 * Informace z banky.
 * Dokumentace vychází z Fio API dokumentace: https://www.fio.cz/docs/cz/API_Bankovnictvi.pdf
 */
/** Úspěšná odpověď z banky s daty. */
export type BankSuccessType = {
    accountStatement: {
        /** Informace o účtu. */
        info: {
            /** Konečný zůstatek na účtu na konci zvoleného období. */
            closingBalance: number
            /** Počátek zvoleného období ve tvaru rrrr-mm-dd+GMT. */
            dateStart?: string
        }
        /** Pohyby na účtu za dané období. */
        transactionList: {
            transaction: {
                /** Datum pohybu ve tvaru rrrr-mm-dd+GMT. */
                column0: { value: string }
                /** Velikost přijaté (odeslané) částky. */
                column1: { value: number }
                /** Název protiúčtu. */
                column10: { value: string } | null
                /** Zpráva pro příjemce. */
                column16: { value: string } | null
                /** Unikátní číslo pohybu - 10 numerických znaků. */
                column22: { value: number }
                /** Komentář. */
                column25: { value: string } | null
            }[]
        }
    }
    /** Časová značka informací z banky. */
    fetch_timestamp: number
    /** Výše nájmu lektorky. */
    rent_price: number
    error_info?: never
}

/** Chybová odpověď z banky. */
export type BankErrorType = {
    /** Popis chyby v případě neúspěšného stažení dat z banky. */
    error_info: string
}

/** Typ pro odpověď z banky - buď úspěšná s daty, nebo chybová pouze se error_info. */
export type BankType = BankSuccessType | BankErrorType

/** Filtry pro statistiky lekcí (`year` vynechán = všechny roky). */
export type StatisticsFilters = {
    year?: number | null
}

/** Statistiky aplikace (GET). */
export type StatisticsType = {
    clients: {
        total: number
        active: number
        inactive: number
        /** Klienti bez jediné účasti (globální stav, bez filtrů). */
        without_lectures: number
    }
    groups: {
        total: number
        active: number
        inactive: number
    }
    lectures: {
        /** Celkový počet lekcí, které fakticky neproběhly (zrušené + skupinové kde všichni omluveni; individuální omluvené jsou ⊆ zrušených). */
        not_happened_count: number
        /** Počet lekcí označených canceled=True. */
        canceled_count: number
        /** Míra zrušení v % (canceled_count / celkový počet lekcí v rozsahu). */
        canceled_rate: number
        /** Omluvené neproběhlé: individuální omluvené (⊆ canceled_count) + skupinové kde všichni omluveni (⊆ not_happened_count). */
        excused_not_happened_count: number
        total: number
        individual: number
        group: number
        /** Odučené minuty – počítá jen lekce, které fakticky proběhly (vynechává neproběhlé). */
        total_minutes: number
        available_years: number[]
        /** Rozklad po kurzech – vždy přítomen, reaguje na filtr roku. */
        by_course: {
            course_id: number
            course_name: string
            course_color: string
            total: number
            individual: number
            group: number
            total_minutes: number
            canceled_count: number
            canceled_rate: number
            excused_not_happened_count: number
        }[]
        /** Vývoj rozložení kurzů po letech – null pokud je vybraný konkrétní rok. */
        by_year_course:
            | {
                  year: number
                  course_id: number
                  course_name: string
                  course_color: string
                  total: number
              }[]
            | null
        /** Rozklad po letech – null pokud je vybraný konkrétní rok. */
        by_year:
            | {
                  year: number
                  total: number
                  individual: number
                  group: number
                  total_minutes: number
                  canceled_count: number
                  canceled_rate: number
                  excused_not_happened_count: number
              }[]
            | null
        /** Nejaktivnější klienti – počty neomluvených účastí na proběhlých lekcích (stejný rozsah jako filtr roku). */
        top_clients: {
            id: number
            firstname: string
            surname: string
            lecture_count: number
        }[]
        /** Skupiny s nejvíce proběhlými lekcemi (počet lekcí ve skupině v rozsahu filtru). */
        top_groups: {
            id: number
            name: string
            lecture_count: number
        }[]
        /** Proběhlé lekce podle měsíce začátku (1–12). U filtru „Celkem“ součty napříč všemi roky. */
        by_month: { month: number; total: number; total_minutes: number }[]
    }
}

/* *************************************************************************************************
Dummy modely pro formuláře.

Oproti běžným modelům možné nastavit vnořené atributy na null.
Protože se použijí jen před POST požadavky, jsou bez ID.
************************************************************************************************* */

/** Dummy model zájemce o kurz. */
export type ApplicationPostApiDummy = Omit<ApplicationType, "course" | "client" | "id"> & {
    course: ApplicationType["course"] | null
    client: ApplicationType["client"] | null
}

/** Dummy model pro stav účasti. */
export type AttendanceStatePostApiDummy = Omit<AttendanceStateType, "id">

/** Dummy model pro klienta. */
export type ClientPostApiDummy = Omit<ClientType, "id" | "last_lecture_date">

/** Dummy model pro kurz. */
export type CoursePostApiDummy = Omit<CourseType, "id">

/** Dummy model pro skupinu. */
export type GroupPostApiDummy = Omit<GroupType, "course" | "id" | "last_lecture_date"> & {
    course: GroupType["course"] | null
}

/** Dummy model pro lekci. */
export type LecturePostApiDummy = Omit<LectureType, "course" | "id"> & {
    course: GroupType["course"] | null
}

/* *************************************************************************************************
Modely pro PUT požadavky na API.

Kvůli odlišným atributům a jejich hodnotám oproti GET, ID entity jim zůstává.
************************************************************************************************* */

/** Zájemce o kurz (PUT). */
export type ApplicationPutApi = Omit<ApplicationType, "course" | "client" | "created_at"> & {
    course_id: CourseType["id"]
    client_id: ClientType["id"]
}

/** Účast (PUT). */
export type AttendancePutApi = Omit<AttendanceType, "remind_pay" | "number" | "client"> & {
    client_id: ClientType["id"]
}

/** Stav účasti (PUT). */
export type AttendanceStatePutApi = AttendanceStateType

/** Klient (PUT). */
export type ClientPutApi = Omit<ClientType, "last_lecture_date">

/** Kurz (PUT). */
export type CoursePutApi = CourseType

/** Skupina (PUT). */
export type GroupPutApi = Omit<GroupType, "course" | "memberships" | "last_lecture_date"> & {
    course_id: CourseType["id"]
    memberships: MembershipPostApi[]
}

/** Lekce (PUT). */
export type LecturePutApi = Omit<LectureType, "course" | "group" | "number" | "attendances"> & {
    course_id?: CourseType["id"]
    group_id: GroupType["id"] | null
    attendances: AttendancePutApi[]
}

/** Členství (PUT). */
export type MembershipPutApi = Omit<MembershipType, "client" | "prepaid_cnt"> & {
    client_id: ClientType["id"]
    prepaid_cnt?: MembershipType["prepaid_cnt"]
}

/* *************************************************************************************************
Modely pro POST požadavky na API.

Kvůli odlišným atributům a jejich hodnotám oproti GET, ID entity není.
************************************************************************************************* */

/** Zájemce o kurz (POST). */
export type ApplicationPostApi = Omit<ApplicationPutApi, "id">

/** Účast (POST). */
export type AttendancePostApi = Omit<AttendancePutApi, "id">

/** Stav účasti (POST). */
export type AttendanceStatePostApi = Omit<AttendanceStatePutApi, "id">

/** Klient (POST). */
export type ClientPostApi = Omit<ClientPutApi, "id">

/** Kurz (POST). */
export type CoursePostApi = Omit<CoursePutApi, "id">

/** Skupina (POST). */
export type GroupPostApi = Omit<GroupPutApi, "id">

/** Lekce (POST). */
export type LecturePostApi = Omit<LecturePutApi, "id" | "attendances"> & {
    attendances: AttendancePostApi[]
}

/** Členství (POST). */
export type MembershipPostApi = Omit<MembershipPutApi, "id">

/* *************************************************************************************************
Modely pro PATCH požadavky na API.

Mají povinné ID, ostatní atributy vychází z modelů pro PUT požadavky, ale jsou volitelné.
************************************************************************************************* */

/** Členství (PATCH). */
export type MembershipPatchApi = PatchType<MembershipPutApi>

/** Účast (PATCH). */
export type AttendancePatchApi = PatchType<AttendancePutApi>

/** Stav účasti (PATCH). */
export type AttendanceStatePatchApi = PatchType<AttendanceStatePutApi>

/* *************************************************************************************************
Typy pro přihlašování.
************************************************************************************************* */

/** Prihlašovací údaje (POST). */
export type AuthorizationType = {
    username: string
    password: string
}

/** Dekódovaný token. */
export type TokenDecodedType = {
    exp: number
    email: string
    username: string
}

/** Token pro přihlašování. */
export type TokenCodedType = string

/** Získaný token z API po přihlášení. */
export type TokenApiType = {
    token: TokenCodedType
}
