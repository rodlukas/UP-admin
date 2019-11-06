import LectureService from "../api/services/lecture"
import { addDays } from "./funcDateTime"

export function groupByCourses(data) {
    // seskup data podle kurzu ve formatu "nazev_kurzu":{course: objekt_s_kurzem, lectures: pole_lekci}
    let groupByCourses = data.reduce((obj, item) => {
        obj[item.course.name] = obj[item.course.name] || {
            course: item.course,
            lectures: []
        }
        obj[item.course.name].lectures.push(item)
        return obj
    }, {})
    // aby se daly kurzy seradit podle abecedy, je potreba prevest strukturu na pole, kazda polozka bude obsahovat objekt z predchozi struktury (hodnotu klice)
    let arrayOfObjects = Object.keys(groupByCourses).map(key => ({
        course: groupByCourses[key].course,
        lectures: groupByCourses[key].lectures
    }))
    // serad kurzy podle abecedy
    arrayOfObjects.sort((a, b) => {
        if (a.course.name < b.course.name) return -1
        if (a.course.name > b.course.name) return 1
        return 0
    })
    return arrayOfObjects
}

export function getLecturesForGroupingByCourses(id, isClient) {
    if (isClient) return LectureService.getAllFromClientOrdered(id, false)
    return LectureService.getAllFromGroupOrdered(id, false)
}

export function getDefaultValuesForLecture(lecturesGroupedByCourses) {
    function result(course = null, start = "") {
        return {
            course,
            start: start === "" || start === null ? "" : addDays(new Date(start), 7)
        }
    }
    // vrat optimalni kurz, jehoz lekce bude s nejvyssi pravdepodobnosti pridavana
    if (lecturesGroupedByCourses.length === 0) return result()
    else if (lecturesGroupedByCourses.length === 1) {
        // chodi na jeden jediny kurz, vyber ho + posledni lekci
        return result(
            lecturesGroupedByCourses[0].course,
            lecturesGroupedByCourses[0].lectures[0].start
        )
    } else if (lecturesGroupedByCourses.length > 1) {
        // chodi na vice kurzu, vyber ten jehoz posledni lekce je nejpozdeji (predplacene jen kdyz neni jina moznost)
        let latestLecturesOfEachCourse = []
        lecturesGroupedByCourses.forEach(elem => latestLecturesOfEachCourse.push(elem.lectures[0]))
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
        return result(latestLecture.course, latestLecture.start)
    }
}

export function prettyAmount(amount) {
    return amount.toLocaleString("cs-CZ")
}

// workaround dokud nebude fungovat required v react-selectu - TODO
export function alertRequired(object, ...inputVals) {
    if (inputVals.some(e => e === null)) {
        alert("Není zvolen žádný " + object + "!")
        return true
    }
    return false
}

export function prettyPhone(phone) {
    return phone ? phone.match(/.{3}/g).join(" ") : ""
}

// vrati value, pokud je value undefined tak vrati prazdny string
export function getAttrSafe(val) {
    return val || ""
}

export function clientName(client) {
    return getAttrSafe(client.surname) + " " + getAttrSafe(client.firstname)
}

export function courseDuration(duration) {
    return "Trvání: " + duration + " min."
}

// overi, ze zaslani clenove skupiny jsou vsichni aktivni
export function areAllMembersActive(memberships) {
    return memberships.every(membership => membership.client.active)
}

// vrati string pouzitelny jako id elementu
export function makeIdFromString(string) {
    return string.replace(/\s+/g, "-")
}
