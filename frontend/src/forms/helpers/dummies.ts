/** Dummy objekty použité pro výchozí hodnoty ve formulářích, když se provádí přidání. */
import { DEFAULT_COLOR, DEFAULT_LECTURE_DURATION_SINGLE } from "../../global/constants"
import {
    ApplicationPostApiDummy,
    AttendanceStatePostApiDummy,
    ClientPostApiDummy,
    CoursePostApiDummy,
    GroupPostApiDummy,
    LecturePostApiDummy
} from "../../types/models"

export const DummyClient: ClientPostApiDummy = {
    active: true,
    email: "",
    note: "",
    phone: "",
    firstname: "",
    surname: ""
}

export const DummyCourse: CoursePostApiDummy = {
    color: DEFAULT_COLOR,
    duration: DEFAULT_LECTURE_DURATION_SINGLE,
    name: "",
    visible: true
}

export const DummyAttendanceState: AttendanceStatePostApiDummy = {
    name: "",
    visible: true,
    default: true,
    excused: true
}

export const DummyGroup: GroupPostApiDummy = {
    active: true,
    name: "",
    memberships: [],
    course: null
}

export const DummyApplication: ApplicationPostApiDummy = {
    client: null,
    course: null,
    note: "",
    created_at: ""
}

export const DummyLecture: LecturePostApiDummy = {
    course: null,
    start: "",
    group: null,
    canceled: false,
    duration: 0,
    attendances: [],
    number: 0
}
