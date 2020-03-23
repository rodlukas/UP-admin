import { LOCALE_CZ, USER_BIRTHDAY, USER_CELEBRATION, USER_NAMEDAY } from "./constants"

/** Počet pracovních dní v týdnu. */
export const WORK_DAYS_COUNT = 5

/** Počet dní v týdnu. */
export const DAYS_IN_WEEK = 7

/** Zjistí, jestli jsou dva datumy stejné. */
export function isEqualDate(date1: Date, date2: Date): boolean {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth()
    )
}

/** Zjistí, jestli je zadaný datum dnešní. */
export function isToday(date: Date): boolean {
    const currentDate = new Date()
    return isEqualDate(date, currentDate)
}

/** Vrátí datum posunutý o zadaný počet dní. */
export function addDays(date: Date, days: number): Date {
    date.setDate(date.getDate() + days)
    return date
}

/**
 * Vrátí čas ve srozumitelném formátu (bez sekund).
 * Minuty jsou zarovnány nulou.
 */
export function prettyTime(datetime: Date): string {
    return (
        datetime.getHours() + ":" + (datetime.getMinutes() < 10 ? "0" : "") + datetime.getMinutes()
    )
}

/** Vrátí zadaný datum ve srozumitelném formátu (den a měsíc nezarovnané nulami). */
export function prettyDate(date: Date): string {
    return date.getDate() + ". " + (date.getMonth() + 1) + "."
}

/** Vrátí zadaný datum ve srozumitelném formátu (včetně roku, den a měsíc nezarovnané nulami). */
export function prettyDateWithYear(date: Date): string {
    return prettyDate(date) + " " + date.getFullYear()
}

/** Zjistí, jestli se rok ze zadaného datumu liší od aktuálního. */
export function yearDiffs(date: Date): boolean {
    return date.getFullYear() !== new Date().getFullYear()
}

/** Vrátí zadaný datum ve srozumitelném formátu (rok pouze odlišný od aktuálního, bez slovní reprezentace dne). */
export function prettyDateWithYearIfDiff(date: Date): string {
    if (!yearDiffs(date)) {
        return prettyDate(date)
    }
    return prettyDateWithYear(date)
}

/** Vrátí zadaný datum ve srozumitelném formátu (včetně roku a nezkrácené slovní reprezentace dne). */
export function prettyDateWithLongDayYear(date: Date): string {
    const day = date.toLocaleDateString(LOCALE_CZ, { weekday: "long" })
    return day + " " + prettyDateWithYear(date)
}

/** Vrátí zadaný datum ve srozumitelném formátu (včetně roku a krátké slovní reprezentace dne). */
export function prettyDateWithDayYear(date: Date): string {
    const day = date.toLocaleDateString(LOCALE_CZ, { weekday: "short" })
    return day + " " + prettyDateWithYear(date)
}

/**
 * Vrátí zadaný datum ve srozumitelném formátu (rok pouze odlišný od aktuálního,
 * nezkrácená slovní reprezentace dne).
 */
export function prettyDateWithLongDayYearIfDiff(date: Date): string {
    const day = date.toLocaleDateString(LOCALE_CZ, { weekday: "long" })
    return day + " " + prettyDateWithYearIfDiff(date)
}

/** Pokud je to možné, převede zadaný datum na slovní reprezentaci typu "včera", jinak vrátí null. */
function convertDayToWords(date: Date): string | null {
    if (isToday(date)) {
        return "dnes"
    } else if (isToday(addDays(date, 1))) {
        return "včera"
    } else if (isToday(addDays(date, -1))) {
        return "zítra"
    }
    return null
}

/**
 * Vrátí zadaný datum ve srozumitelném formátu (rok pouze odlišný od aktuálního, krátká slovní reprezentace dne).
 * Volba convertToWord umožňuje, pokud je to možné, převést datum např. na "včera".
 */
export function prettyDateWithDayYearIfDiff(date: Date, convertToWord = false): string {
    if (convertToWord) {
        const convertedDayToWords = convertDayToWords(date)
        if (convertedDayToWords) {
            return convertedDayToWords
        }
    }
    const day = date.toLocaleDateString(LOCALE_CZ, { weekday: "short" })
    return day + " " + prettyDateWithYearIfDiff(date)
}

/**
 * Vrátí čas ve srozumitelném formátu (včetně sekund).
 * Minuty a sekundy jsou zarovnány nulou.
 */
export function prettyTimeWithSeconds(datetime: Date): string {
    return (
        prettyTime(datetime) + ":" + (datetime.getSeconds() < 10 ? "0" : "") + datetime.getSeconds()
    )
}

/** Vrátí zadaný datum a čas ve srozumitelném formátu (včetně roku, sekund a krátké slovní reprezentace dne). */
export function prettyDateTime(datetime: Date): string {
    return prettyDateWithDayYear(datetime) + " " + prettyTimeWithSeconds(datetime)
}

/**
 * Vrátí zadaný datum v ISO formátu.
 * Hodiny a minuty jsou zarovnány nulou, rok je čtyřmístný.
 */
export function toISODate(date: Date): string {
    return (
        date.getFullYear() +
        "-" +
        (date.getMonth() + 1 < 10 ? "0" : "") +
        (date.getMonth() + 1) +
        "-" +
        (date.getDate() < 10 ? "0" : "") +
        date.getDate()
    )
}

/**
 * Vrátí čas (hodiny a minuty) ze zadaného datetime v ISO formátu.
 * Hodiny i minuty jsou zarovnány nulou.
 */
export function toISOTime(datetime: Date): string {
    return (
        (datetime.getHours() < 10 ? "0" : "") +
        datetime.getHours() +
        ":" +
        (datetime.getMinutes() < 10 ? "0" : "") +
        datetime.getMinutes()
    )
}

/** Vrátí datum nejbližšího pondělí předcházejícího danému datumu (případně tentýž datum, pokud už je pondělí). */
export function getMonday(date: Date): Date {
    date.setDate(date.getDate() + 1 - (date.getDay() || 7))
    return date
}

/** Vrať pole datumů pracovních dnů v příslušném týdnu začínajícím daným pondělím. */
export function getWeekSerializedFromMonday(monday: Date): Array<string> {
    const week: Array<string> = []
    let dayToProcess = monday
    while (week.length < WORK_DAYS_COUNT) {
        week.push(toISODate(dayToProcess))
        dayToProcess = addDays(dayToProcess, 1)
    }
    return week
}

/** Zjisti, zda má uživatel narozeniny/svátek a vrať, co má. */
export function isUserCelebrating(date: Date): number {
    const curMonth = date.getMonth(),
        curDate = date.getDate()
    if (curMonth === USER_BIRTHDAY.month && curDate === USER_BIRTHDAY.date) {
        return USER_CELEBRATION.BIRTHDAY
    } else if (curMonth === USER_NAMEDAY.month && curDate === USER_NAMEDAY.date) {
        return USER_CELEBRATION.NAMEDAY
    }
    return USER_CELEBRATION.NOTHING
}
