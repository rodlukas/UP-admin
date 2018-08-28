export const WORK_DAYS_COUNT = 5
export const DAYS_IN_WEEK = 7

function convertDayToWords(date, callback) {
    if(isToday(date))
        return "dnes"
    else if(isToday(addDays(date, 1)))
        return "zítra"
    else if (isToday(addDays(date, -1)))
        return "včera"
    else
        return callback(date)
}

export function prettyDate(date) {
    return date.getDate() + ". " + (date.getMonth() + 1) + "."
}

export function prettyDateWithYear(date) {
    return prettyDate(date) + " " + (date.getFullYear())
}

export function prettyDateTime(datetime) {
    return prettyDateWithDayYear(datetime) + " " + prettyTimeWithSeconds(datetime)
}

// vrati uzivatelsky privetivy datum, pokud je rok odlisny od aktualniho tak jej pripoji
export function prettyDateWithYearIfDiff(date) {
    if(date.getFullYear() === new Date().getFullYear())
        return prettyDate(date)
    return prettyDateWithYear(date)
}

export function prettyDateWithLongDayYear(date) {
    const day = date.toLocaleDateString('cs-CZ', {weekday: 'long'})
    return day + " " + prettyDateWithYear(date)
}

export function prettyDateWithLongDayYearIfDiff(date) {
    const day = date.toLocaleDateString('cs-CZ', {weekday: 'long'})
    return day + " " + prettyDateWithYearIfDiff(date)
}

export function prettyDateWithDayYearIfDiff(date, convertToWords = false) {
    const day = date.toLocaleDateString('cs-CZ', {weekday: 'short'})
    if(convertToWords)
        return convertDayToWords(date, prettyDateWithDayYearIfDiff)
    return day + " " + prettyDateWithYearIfDiff(date)
}

export function prettyDateWithDayYear(date) {
    const day = date.toLocaleDateString('cs-CZ', {weekday: 'short'})
    return day + " " + prettyDateWithYear(date)
}

export function toISODate(date) {
    return date.getFullYear() + "-" + ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1) + "-" + (date.getDate() < 10 ? '0' : '') + date.getDate()
}

export function prettyTime(datetime) {
    return datetime.getHours() + ":" + (datetime.getMinutes() < 10 ? '0' : '') + datetime.getMinutes()
}

export function prettyTimeWithSeconds(datetime) {
    return prettyTime(datetime) + ":" + (datetime.getSeconds() < 10 ? '0' : '') + datetime.getSeconds()
}

export function toISOTime(date) {
    return (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
}

export function isToday(date) {
    const currentDate = new Date()
    return isEqualDate(date, currentDate)
}

export function isEqualDate(date1, date2) {
    return (
        date1.getDate()     === date2.getDate() &&
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth()    === date2.getMonth())
}

// zjisti datum nejblizsiho pondeli predchazejici datumu (pripadne tentyz datum pokud uz pondeli je)
export function getMonday(date) {
    date.setDate(date.getDate() + 1 - (date.getDay() || 7))
    return date
}

// prida k zadanemu datumu prislusny pocet dni a vrati takto navyseny datum
export function addDays(date, days) {
    date.setDate(date.getDate() + days)
    return date
}

// priprav pole datumu pracovnich dnu v prislusnem tydnu
export function getWeekSerializedFromMonday(monday) {
    let week = [], dayToProcess = monday
    while (week.length < WORK_DAYS_COUNT) {
        week.push(toISODate(dayToProcess))
        dayToProcess = addDays(dayToProcess, 1)
    }
    return week
}
