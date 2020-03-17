import { Model, PatchType } from "./types"

/* *************************************************************************************************
Modely pro GET požadavky na API.

Reprezentují data tak, jak je obdržíme z API.
Respektují způsoby vnoření dat a všechny možnosti API.
************************************************************************************************* */

export type ClientType = Model & {
    active: boolean
    email: string
    note: string
    phone: string
    firstname: string
    surname: string
}

export type ClientActiveType = ClientType & {
    normalized: Array<string>
}

export type CourseType = Model & {
    name: string
    color: string
    duration: number
    visible: boolean
}

export type MembershipType = Model & {
    prepaid_cnt: number
    client: ClientType
}

export type ApplicationType = Model & {
    note: string
    created_at: string
    client: ClientType
    course: CourseType
}

export type LectureTypeWithDate = LectureType & {
    start: string
}

export type LectureType = Model & {
    course: CourseType
    start: string | null
    group: null | GroupType
    number: number
    canceled: boolean
    duration: number
    attendances: Array<AttendanceType>
}

export type AttendanceType = Model & {
    client: ClientType
    remind_pay: boolean
    note: string
    paid: boolean
    // !! bez vnoreni
    attendancestate: AttendanceStateType["id"]
}

export type GroupType = Model & {
    name: string
    memberships: Array<MembershipType>
    active: boolean
    course: CourseType
}

export type AttendanceStateType = Model & {
    name: string
    visible: boolean
    default?: boolean
    excused?: boolean
}

export type AuthorizationType = {
    username: string
    password: string
}

export type TokenDecodedType = {
    exp: number
    email: string
    username: string
}

export type TokenCodedType = string

export type TokenApiType = {
    token: TokenCodedType
}

/**
 * Informace z banky.
 * Dokumentace vychází z Fio API dokumentace: https://www.fio.cz/docs/cz/API_Bankovnictvi.pdf
 */
export type BankType = {
    accountStatement: {
        /** informace o účtu */
        info: {
            /** konečný zůstatek na účtu na konci zvoleného období */
            closingBalance: number | null
            /** počátek zvoleného období ve tvaru rrrr-mm-dd+GMT */
            dateStart?: string
        }
        /** pohyby na účtu za dané období */
        transactionList: {
            transaction: Array<{
                /** datum pohybu ve tvaru rrrr-mm-dd+GMT */
                column0: { value: string }
                /** velikost přijaté (odeslané) částky */
                column1: { value: number }
                /** název protiúčtu */
                column10: { value: string } | null
                /** zpráva pro příjemce */
                column16: { value: string } | null
                /** unikátní číslo pohybu - 10 numerických znaků */
                column22: { value: number }
                /** komentář */
                column25: { value: string } | null
            }>
        }
    }
    fetch_timestamp: number | null
    rent_price: number | null
    status_info?: string
}

/* *************************************************************************************************
Dummy modely pro formuláře.

Oproti běžným modelům možné nastavit vnořené atributy na null.
Protože se použijí jen před POST požadavky, jsou bez ID.
************************************************************************************************* */

export type ApplicationPostApiDummy = Omit<ApplicationType, "course" | "client" | "id"> & {
    course: ApplicationType["course"] | null
    client: ApplicationType["client"] | null
}

export type AttendanceStatePostApiDummy = Omit<AttendanceStateType, "id">

export type ClientPostApiDummy = Omit<ClientType, "id">

export type CoursePostApiDummy = Omit<CourseType, "id">

export type GroupPostApiDummy = Omit<GroupType, "course" | "id"> & {
    course: GroupType["course"] | null
}

export type LecturePostApiDummy = Omit<LectureType, "course" | "id"> & {
    course: GroupType["course"] | null
}

/* *************************************************************************************************
Modely pro PUT požadavky na API.

Kvůli odlišným atributům a jejich hodnotám oproti GET, ID entity jim zůstává.
************************************************************************************************* */

export type ApplicationPutApi = Omit<ApplicationType, "course" | "client" | "created_at"> & {
    course_id: CourseType["id"]
    client_id: ClientType["id"]
}

export type AttendancePutApi = Omit<AttendanceType, "remind_pay" | "client"> & {
    client_id: ClientType["id"]
}

export type AttendanceStatePutApi = AttendanceStateType

export type ClientPutApi = ClientType

export type CoursePutApi = CourseType

export type GroupPutApi = Omit<GroupType, "course" | "memberships"> & {
    course_id: CourseType["id"]
    memberships: Array<MembershipPostApi>
}

export type LecturePutApi = Omit<LectureType, "course" | "group" | "number" | "attendances"> & {
    course_id?: CourseType["id"]
    group_id: GroupType["id"] | null
    attendances: Array<AttendancePutApi>
}

export type MembershipPutApi = Omit<MembershipType, "client" | "prepaid_cnt"> & {
    client_id: ClientType["id"]
    prepaid_cnt?: MembershipType["prepaid_cnt"]
}

/* *************************************************************************************************
Modely pro POST požadavky na API.

Kvůli odlišným atributům a jejich hodnotám oproti GET, ID entity není.
************************************************************************************************* */

export type ApplicationPostApi = Omit<ApplicationPutApi, "id">

export type AttendancePostApi = Omit<AttendancePutApi, "id">

export type AttendanceStatePostApi = Omit<AttendanceStatePutApi, "id">

export type ClientPostApi = Omit<ClientPutApi, "id">

export type CoursePostApi = Omit<CoursePutApi, "id">

export type GroupPostApi = Omit<GroupPutApi, "id">

export type LecturePostApi = Omit<LecturePutApi, "id" | "attendances"> & {
    attendances: Array<AttendancePostApi>
}

export type MembershipPostApi = Omit<MembershipPutApi, "id">

/* *************************************************************************************************
Modely pro PATCH požadavky na API.

Mají povinné ID, ostatní atributy vychází z modelů pro PUT požadavky, ale jsou volitelné.
************************************************************************************************* */

export type MembershipPatchApi = PatchType<MembershipPutApi>

export type AttendancePatchApi = PatchType<AttendancePutApi>

export type AttendanceStatePatchApi = PatchType<AttendanceStatePutApi>
