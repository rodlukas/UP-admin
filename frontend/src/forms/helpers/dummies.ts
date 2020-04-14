/* *************************************************************************************************
Dummy objekty použité pro výchozí hodnoty ve formulářích, když se provádí přidání.
************************************************************************************************* */
import { DEFAULT_COLOR, DEFAULT_LECTURE_DURATION_SINGLE } from "../../global/constants"
import {
    ApplicationPostApiDummy,
    AttendanceStatePostApiDummy,
    ClientPostApiDummy,
    CoursePostApiDummy,
    GroupPostApiDummy,
    LecturePostApiDummy,
} from "../../types/models"

/** Dummy klient. */
export const DummyClient: ClientPostApiDummy = {
    active: true,
    email: "",
    note: "",
    phone: "",
    firstname: "",
    surname: "",
}

/** Dummy kurz. */
export const DummyCourse: CoursePostApiDummy = {
    color: DEFAULT_COLOR,
    duration: DEFAULT_LECTURE_DURATION_SINGLE,
    name: "",
    visible: true,
}

/** Dummy stav účasti. */
export const DummyAttendanceState: AttendanceStatePostApiDummy = {
    name: "",
    visible: true,
    default: true,
    excused: true,
}

/** Dummy skupina. */
export const DummyGroup: GroupPostApiDummy = {
    active: true,
    name: "",
    memberships: [],
    course: null,
}

/** Dummy zájemce o kurz. */
export const DummyApplication: ApplicationPostApiDummy = {
    client: null,
    course: null,
    note: "",
    created_at: "",
}

/** Dummy lekce. */
export const DummyLecture: LecturePostApiDummy = {
    course: null,
    start: "",
    group: null,
    canceled: false,
    duration: 0,
    attendances: [],
    number: 0,
}
