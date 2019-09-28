import LectureService from "../api/services/lecture"

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

export function getDefaultCourse(lecturesGroupedByCourses, isClient) {
    // vrat optimalni kurz, jehoz lekce bude s nejvyssi pravdepodobnosti pridavana
    if (isClient) {
        if (lecturesGroupedByCourses.length === 0) return null
        else if (lecturesGroupedByCourses.length === 1)
            // chodi na jeden jediny kurz, vyber ho
            return lecturesGroupedByCourses[0].course
        else if (lecturesGroupedByCourses.length > 1) {
            // chodi na vice kurzu, vyber ten jehoz posledni lekce je nejpozdeji (predplacene jen kdyz neni jina moznost)
            let latestLecturesOfEachCourse = []
            lecturesGroupedByCourses.forEach(elem =>
                latestLecturesOfEachCourse.push(elem.lectures[0])
            )
            const latestLecture = latestLecturesOfEachCourse.reduce((prev, current) =>
                prev.start > current.start ? prev : current
            )
            return latestLecture.course
        }
    }
    return null
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
