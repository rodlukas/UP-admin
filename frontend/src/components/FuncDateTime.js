export function prettyDate(date) {
    return date.getDate() + ". " + (date.getMonth() + 1) + "."
}

export function prettyDateWithDay(date) {
    const day = date.toLocaleDateString('cs-CZ', {weekday: 'long'})
    return day + " " + prettyDate(date)
}

export function toISODate(date) {
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
}

export function prettyTime(datetime) {
    return datetime.getHours() + ":" + (datetime.getMinutes() < 10 ? '0' : '') + datetime.getMinutes()
}
