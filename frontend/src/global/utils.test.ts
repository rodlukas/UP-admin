import { CourseType, LectureType } from "../types/models"

import { TEXTS } from "./constants"
import { addDays } from "./funcDateTime"
import {
    courseSelectError,
    getDefaultValuesForLecture,
    GroupedObjectsByCourses,
    pluralizeCs,
} from "./utils"

function createCourse(id: number, name: string): CourseType {
    return { id, name, color: "#000000", duration: 30, visible: true }
}

function createLecture(id: number, course: CourseType, start: string | null): LectureType {
    return {
        id,
        course,
        start,
        group: null,
        number: 1,
        canceled: false,
        duration: 30,
        attendances: [],
    }
}

/** Vytvoří strukturu seskupenou podle kurzů - lekce v `objects` jsou už seřazené od nejnovější. */
function group(...lectures: LectureType[]): GroupedObjectsByCourses<LectureType> {
    return lectures.map((lecture) => ({ course: lecture.course, objects: [lecture] }))
}

describe("getDefaultValuesForLecture", () => {
    test("returns empty defaults when there are no lectures", () => {
        expect(getDefaultValuesForLecture([])).toEqual({ course: null, start: "" })
    })

    test("returns the only course with start one week after the last lecture", () => {
        const course = createCourse(1, "Slabikář")
        const result = getDefaultValuesForLecture(
            group(createLecture(11, course, "2023-04-01T10:00:00")),
        )
        expect(result.course).toBe(course)
        expect(result.start).toStrictEqual(addDays(new Date("2023-04-01T10:00:00"), 7))
    })

    test("picks the course whose latest lecture is the latest, regardless of course order", () => {
        const courseA = createCourse(1, "Slabikář")
        const courseB = createCourse(2, "Máme doma prvňáčka")
        const courseC = createCourse(3, "Předškolák")
        // nejpozdejsi lekce (courseB) je zamerne uprostred - nesmi vyhrat prvni ani posledni kurz
        const result = getDefaultValuesForLecture(
            group(
                createLecture(11, courseA, "2023-03-05T10:00:00"),
                createLecture(12, courseB, "2023-05-01T16:30:00"),
                createLecture(13, courseC, "2023-04-01T10:00:00"),
            ),
        )
        expect(result.course).toBe(courseB)
        expect(result.start).toStrictEqual(addDays(new Date("2023-05-01T16:30:00"), 7))
    })

    test("prefers a course with a prepaid lecture (start is null) over later lectures", () => {
        const courseA = createCourse(1, "Slabikář")
        const courseB = createCourse(2, "Máme doma prvňáčka")
        const result = getDefaultValuesForLecture(
            group(
                createLecture(11, courseA, "2023-05-01T10:00:00"),
                createLecture(12, courseB, null),
            ),
        )
        expect(result.course).toBe(courseB)
        expect(result.start).toBe("")
    })
})

test.each([
    [0, "členů"],
    [1, "člen"],
    [2, "členové"],
    [4, "členové"],
    [5, "členů"],
    [11, "členů"],
])("pluralizeCs picks the Czech form for %i", (count, expected) => {
    expect(pluralizeCs(count, "člen", "členové", "členů")).toBe(expected)
})

// Rozdíl "kurzy se nenačetly" vs "kurzy jsou načtené, jen jich je nula" je jediný důvod,
// proč tahle funkce existuje - prázdný Select by jinak v obou případech hlásil "Vyberte kurz"
describe("courseSelectError", () => {
    test("stays silent until the user tries to submit", () => {
        expect(courseSelectError(false, false, { hasData: false })).toBeUndefined()
    })

    test("stays silent when a course is selected", () => {
        expect(courseSelectError(true, true, { hasData: false })).toBeUndefined()
    })

    test("asks for a course when the list loaded (even if it's empty)", () => {
        expect(courseSelectError(true, false, { hasData: true })).toBe("Vyberte kurz")
    })

    // `hasData`, ne `isSuccess`: při SELHANÉM REFETCHI si TanStack Query data z cache nechá,
    // takže Select je pořád plný - poslat uživatele řešit síť by bylo zavádějící
    test("reports a load failure only when no courses ever arrived", () => {
        expect(courseSelectError(true, false, { hasData: false })).toBe(TEXTS.ERROR_COURSES_LOAD)
    })
})
