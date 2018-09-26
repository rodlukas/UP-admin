export function groupByCourses(data) {
    // seskup data podle kurzu ve formatu key : values (values je pole)
    let groupByCourses = data
        .reduce((obj, item) => {
            obj[item.course.name] = obj[item.course.name] || []
            obj[item.course.name].push(item)
            return obj
        }, {})
    // aby se daly kurzy seradit podle abecedy, je potreba prevest strukturu na pole
    let arrayOfObjects = Object.keys(groupByCourses)
        .map(key => ({course: key, values: groupByCourses[key]}))
    // serad kurzy podle abecedy
    arrayOfObjects.sort((a, b) => { // serad podle abecedy
        if (a.course < b.course) return -1
        if (a.course > b.course) return 1
        return 0
    })
    return arrayOfObjects
}

export function prettyAmount(amount) {
    return amount.toLocaleString('cs-CZ')
}

// workaround dokud nebude fungovat required v react-selectu - TODO
export function alertRequired(object, ...inputVals) {
    if(inputVals.some(e => e === null)) {
        alert("Není zvolen žádný " + object + "!")
        return true
    }
    return false
}

export function prettyPhone(phone) {
    return phone.match(/.{3}/g).join(' ')
}
