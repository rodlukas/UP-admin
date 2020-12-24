import * as React from "react"

import LectureService from "../api/services/LectureService"
import {
    ApplicationType,
    ClientType,
    CourseType,
    LectureType,
    MembershipType,
} from "../types/models"

import { LOCALE_CZ } from "./constants"
import { addDays } from "./funcDateTime"
import { getEnvNameShort, isEnvProduction } from "./funcEnvironments"

export type GroupedObjectsByCourses<O> = Array<{ course: CourseType; objects: Array<O> }>

type GroupedObjectsByCoursesReduce<O> = { [key: string]: { course: CourseType; objects: Array<O> } }

/** Vrátí zaslané objekty seskupené podle kurzů. */
export function groupObjectsByCourses<O extends ApplicationType | LectureType>(
    objects: Array<O>
): GroupedObjectsByCourses<O> {
    // seskup data podle kurzu ve formatu "nazev_kurzu": {course: objekt_s_kurzem, objects: pole_objektu}
    const groupByCourses = objects.reduce((obj: GroupedObjectsByCoursesReduce<O>, item: O) => {
        if (!obj[item.course.name]) {
            obj[item.course.name] = {
                course: item.course,
                objects: [],
            }
        }
        obj[item.course.name].objects.push(item)
        return obj
    }, {})
    // aby se daly kurzy seradit podle abecedy, je potreba prevest strukturu na pole,
    // kazda polozka bude obsahovat objekt z predchozi struktury (hodnotu klice)
    const arrayOfObjects = Object.keys(groupByCourses).map((key) => ({
        course: groupByCourses[key].course,
        objects: groupByCourses[key].objects,
    }))
    // serad kurzy podle abecedy
    arrayOfObjects.sort((a, b) => {
        if (a.course.name < b.course.name) {
            return -1
        }
        if (a.course.name > b.course.name) {
            return 1
        }
        return 0
    })
    return arrayOfObjects
}

/** Získá z API lekce roztříděné podle skupin. */
export function getLecturesgroupedByCourses(
    id: number,
    isClient: boolean
): Promise<GroupedObjectsByCourses<LectureType>> {
    const requestLectures = isClient
        ? LectureService.getAllFromClientOrdered(id, false)
        : LectureService.getAllFromGroupOrdered(id, false)
    return requestLectures.then((lectures) => groupObjectsByCourses(lectures))
}

/** Návratový typ pro funkci getDefaultValuesForLecture (a také pro funkci, kterou používá - prepareDefaultValuesForLecture). */
export type DefaultValuesForLecture = {
    course: CourseType | null
    start: Date | ""
}

/** Vrátí zaslaný kurz a start lekce nebo výchozí hodnoty. */
export function prepareDefaultValuesForLecture(
    course: CourseType | null = null,
    start: string | null = ""
): DefaultValuesForLecture {
    return {
        course,
        start: start === "" || start === null ? "" : addDays(new Date(start), 7),
    }
}

/** Vrátí optimální kurz, jehož lekce bude s nejvyšší pravděpodobností přidávána a odhadnutý start lekce. */
export function getDefaultValuesForLecture(
    lecturesGroupedByCourses: GroupedObjectsByCourses<LectureType>
): DefaultValuesForLecture {
    // nemame co vratit
    if (lecturesGroupedByCourses.length === 0) {
        return prepareDefaultValuesForLecture()
    }
    // chodi na jeden jediny kurz, vyber ho + start posledni lekce
    else if (lecturesGroupedByCourses.length === 1) {
        return prepareDefaultValuesForLecture(
            lecturesGroupedByCourses[0].course,
            lecturesGroupedByCourses[0].objects[0].start
        )
    }
    // chodi na vice kurzu, vyber ten jehoz posledni lekce je nejpozdeji (preferuj ten s predplacenymi lekcemi)
    else {
        const latestLecturesOfEachCourse: Array<LectureType> = lecturesGroupedByCourses.map(
            (elem) => elem.objects[0]
        )
        // pro porovnani se vyuziva lexicographical order
        // (ISO pro datum a cas to podporuje, viz https://en.wikipedia.org/wiki/ISO_8601#General_principles)
        let latestLecture = latestLecturesOfEachCourse[0]
        for (const item of latestLecturesOfEachCourse) {
            // uprednostnujeme predplacene lekce, pri jejich nalezeni ihned koncime
            if (item.start === null) {
                latestLecture = item
                break
            }
            // nejedna se o predplacene lekce, srovname a vratime tu pozdejsi
            latestLecture = latestLecture > item ? latestLecture : item
        }
        return prepareDefaultValuesForLecture(latestLecture.course, latestLecture.start)
    }
}

/** Vrátí částku ve srozumitelném formátu. */
export function prettyAmount(amount: number): string {
    return amount.toLocaleString(LOCALE_CZ)
}

/** Workaround dokud nebude fungovat required v react-selectu - TODO. */
export function alertRequired(
    object: string,
    ...inputVals: Array<CourseType | ClientType | null>
): boolean {
    if (inputVals.some((e) => e === null)) {
        alert(`Není zvolen žádný ${object}!`)
        return true
    }
    return false
}

/** Vrátí telefonní číslo ve srozumitelném formátu. */
export function prettyPhone(phone: ClientType["phone"]): string {
    if (!phone) {
        return ""
    }
    const numberParts = phone.match(/.{3}/g)
    return numberParts ? numberParts.join(" ") : phone
}

/** Vrátí celé jméno klienta. */
export function clientName(client: ClientType): string {
    return `${client.surname} ${client.firstname}`
}

/** Vrátí trvání kurzu ve srozumitelném formátu. */
export function courseDuration(duration: LectureType["duration"]): string {
    return `Trvání: ${duration} min.`
}

/** Zjistí, jestli jsou všichni členové skupiny aktivní. */
export function areAllMembersActive(memberships: Array<MembershipType>): boolean {
    return memberships.every((membership) => membership.client.active)
}

/** Vrátí string validní pro použití jako ID elementu. */
export function makeIdFromString(string: string): string {
    return string.replace(/\s+/g, "-")
}

/** Zjistí, jestli je otevřené bootstrap modální okno. */
export function isModalShown(): boolean {
    return document.querySelectorAll(".modal-open").length !== 0
}

/** Vrátí string s velkým počátečním písmenem. */
export function capitalizeString(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

/** Prázdná funkce. */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = (): void => {}

/** Vrátí title pro stránku. */
export function pageTitle(title: string): string {
    const envTitle = !isEnvProduction() ? `${getEnvNameShort()} | ` : ""
    return `${envTitle + title} – ÚPadmin`
}

/** Vrátí jméno komponenty pro React Developer Tools. */
export function getDisplayName<P>(Component: React.ComponentType<P>): string {
    return Component.displayName || Component.name || "UnknownComponent"
}
