export function prettyDate(date) {
    return date.getDate() + ". " + (date.getMonth() + 1) + "."
}

export function prettyDateWithYear(date) {
    return prettyDate(date) + " " + (date.getFullYear())
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
