export function prettyDate(date) {
    return date.getDate() + ". " + (date.getMonth() + 1) + "."
}

export function prettyDateWithYear(date) {
    return prettyDate(date) + " " + (date.getFullYear())
}

export function prettyDateWithDay(date) {
    const day = date.toLocaleDateString('cs-CZ', {weekday: 'long'})
    return day + " " + prettyDate(date)
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
