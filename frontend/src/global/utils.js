export function groupByCourses(data) {
    // seskup data podle kurzu ve formatu "nazev_kurzu":{course: objekt_s_kurzem, lectures: pole_lekci}
    let groupByCourses = data.reduce((obj, item) => {
        obj[item.course.name] = obj[item.course.name] || {course: item.course, lectures: []}
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

export function prettyAmount(amount) {
    return amount.toLocaleString('cs-CZ')
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
    return phone ? phone.match(/.{3}/g).join(' ') : ""
}

// vrati value, pokud je value undefined tak vrati prazdny string
export function getAttrSafe(val) {
    return val || ''
}

export function clientName(client) {
    return getAttrSafe(client.surname) + " " + getAttrSafe(client.name)
}

export function courseDuration(duration) {
    return "Trvání: " + duration + " min."
}
