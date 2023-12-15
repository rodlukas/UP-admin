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
export type BankType = {
    accountStatement: {
        /** Informace o účtu. */
        info: {
            /** Konečný zůstatek na účtu na konci zvoleného období. */
            closingBalance: number | null
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
    fetch_timestamp: number | null
    /** Výše nájmu lektorky. */
    rent_price: number | null
    /** Popis chyby v případě neúspěšného stažení dat z banky. */
    status_info?: string
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
export type ClientPostApiDummy = Omit<ClientType, "id">

/** Dummy model pro kurz. */
export type CoursePostApiDummy = Omit<CourseType, "id">

/** Dummy model pro skupinu. */
export type GroupPostApiDummy = Omit<GroupType, "course" | "id"> & {
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
export type ClientPutApi = ClientType

/** Kurz (PUT). */
export type CoursePutApi = CourseType

/** Skupina (PUT). */
export type GroupPutApi = Omit<GroupType, "course" | "memberships"> & {
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
