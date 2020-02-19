import LectureService from "../api/services/lecture"
import { addDays } from "./funcDateTime"

/** Získá z API lekce roztříděné podle skupin. */
export function getLecturesgroupedByCourses(id, isClient) {
    const request_lectures = isClient
        ? LectureService.getAllFromClientOrdered(id, false)
        : LectureService.getAllFromGroupOrdered(id, false)
    return request_lectures.then(lectures => groupObjectsByCourses(lectures))
}

/** Vrátí zaslané objekty seskupené podle kurzů. */
export function groupObjectsByCourses(objects) {
    // seskup data podle kurzu ve formatu "nazev_kurzu": {course: objekt_s_kurzem, objects: pole_objektu}
    let groupByCourses = objects.reduce((obj, item) => {
        obj[item.course.name] = obj[item.course.name] || {
            course: item.course,
            objects: []
        }
        obj[item.course.name].objects.push(item)
        return obj
    }, {})
    // aby se daly kurzy seradit podle abecedy, je potreba prevest strukturu na pole,
    // kazda polozka bude obsahovat objekt z predchozi struktury (hodnotu klice)
    let arrayOfObjects = Object.keys(groupByCourses).map(key => ({
        course: groupByCourses[key].course,
        objects: groupByCourses[key].objects
    }))
    // serad kurzy podle abecedy
    arrayOfObjects.sort((a, b) => {
        if (a.course.name < b.course.name) return -1
        if (a.course.name > b.course.name) return 1
        return 0
    })
    return arrayOfObjects
}

/** Vrátí zaslaný kurz a start lekce nebo výchozí hodnoty. */
export function prepareDefaultValuesForLecture(course = null, start = "") {
    return {
        course,
        start: start === "" || start === null ? "" : addDays(new Date(start), 7)
    }
}

/** Vrátí optimální kurz, jehož lekce bude s nejvyšší pravděpodobností přidávána a odhadnutý start lekce. */
export function getDefaultValuesForLecture(lecturesGroupedByCourses) {
    // nemame co vratit
    if (lecturesGroupedByCourses.length === 0) return prepareDefaultValuesForLecture()
    // chodi na jeden jediny kurz, vyber ho + start posledni lekce
    else if (lecturesGroupedByCourses.length === 1) {
        return prepareDefaultValuesForLecture(
            lecturesGroupedByCourses[0].course,
            lecturesGroupedByCourses[0].objects[0].start
        )
    }
    // chodi na vice kurzu, vyber ten jehoz posledni lekce je nejpozdeji (predplacene jen kdyz neni jina moznost)
    else {
        let latestLecturesOfEachCourse = []
        lecturesGroupedByCourses.forEach(elem => latestLecturesOfEachCourse.push(elem.objects[0]))
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
export function prettyAmount(amount) {
    return amount.toLocaleString("cs-CZ")
}

/** Workaround dokud nebude fungovat required v react-selectu - TODO. */
export function alertRequired(object, ...inputVals) {
    if (inputVals.some(e => e === null)) {
        alert("Není zvolen žádný " + object + "!")
        return true
    }
    return false
}

/** Vrátí telefonní číslo ve srozumitelném formátu. */
export function prettyPhone(phone) {
    if (!phone) return ""
    const numberParts = phone.match(/.{3}/g)
    return numberParts ? numberParts.join(" ") : phone
}

/**
 * Vrátí value, pokud je undefined, vrátí prázdný string.
 * Value může být undefined např. než se načtou data z API do komponenty/rodiče.
 */
export function getAttrSafe(value) {
    return value || ""
}

/** Vrátí celé jméno klienta. */
export function clientName(client) {
    return getAttrSafe(client.surname) + " " + getAttrSafe(client.firstname)
}

/** Vrátí trvání kurzu ve srozumitelném formátu. */
export function courseDuration(duration) {
    return "Trvání: " + duration + " min."
}

/** Zjistí, jestli jsou všichni členové skupiny aktivní. */
export function areAllMembersActive(memberships) {
    return memberships.every(membership => membership.client.active)
}

/** Vrátí string validní pro použití jako ID elementu. */
export function makeIdFromString(string) {
    return string.replace(/\s+/g, "-")
}

/** Zjistí, jestli je otevřené bootstrap modální okno. */
export function isModalShown() {
    return document.querySelectorAll(".modal-open").length !== 0
}

/** Vrátí string s velkým počátečním písmenem. */
export function capitalizeString(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}
