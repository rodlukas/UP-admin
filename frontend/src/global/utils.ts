import chroma from "chroma-js"

import LectureService from "../api/services/LectureService"
import {
    ApplicationType,
    ClientType,
    CourseType,
    LectureType,
    MembershipType,
} from "../types/models"

import { DAYS_WITHOUT_LECTURE_WARNING, LOCALE_CZ } from "./constants"
import { addDays } from "./funcDateTime"
import { getEnvNameShort, isEnvProduction } from "./funcEnvironments"

/**
 * Jednoduché české skloňování podle počtu: vrátí `one` pro 1, `few` pro 2–4, jinak `many`.
 * Sjednocuje opakovaný count→tvar vzorec z přehledů klientů a skupin.
 *
 * Nula bere `many` („0 členů“), ne `few` — genitiv plurálu, stejně jako u pěti a víc.
 */
export const pluralizeCs = (count: number, one: string, few: string, many: string): string => {
    if (count === 1) {
        return one
    }
    if (count >= 2 && count < 5) {
        return few
    }
    return many
}

export type GroupedObjectsByCourses<O> = { course: CourseType; objects: O[] }[]

type GroupedObjectsByCoursesReduce<O> = Record<string, { course: CourseType; objects: O[] }>

/** Vrátí zaslané objekty seskupené podle kurzů. */
export function groupObjectsByCourses<O extends ApplicationType | LectureType>(
    objects: O[],
): GroupedObjectsByCourses<O> {
    // seskup data podle kurzu ve formatu "nazev_kurzu": {course: objekt_s_kurzem, objects: pole_objektu}
    const groupByCourses = objects.reduce((obj: GroupedObjectsByCoursesReduce<O>, item: O) => {
        if (!obj[item.course.name]) {
            obj[item.course.name] = {
                course: item.course,
                objects: [],
            }
        }
        obj[item.course.name].objects.push(item)
        return obj
    }, {})
    // aby se daly kurzy seradit podle abecedy, je potreba prevest strukturu na pole,
    // kazda polozka bude obsahovat objekt z predchozi struktury (hodnotu klice)
    const arrayOfObjects = Object.keys(groupByCourses).map((key) => ({
        course: groupByCourses[key].course,
        objects: groupByCourses[key].objects,
    }))
    // serad kurzy podle abecedy
    arrayOfObjects.sort((a, b) => {
        if (a.course.name < b.course.name) {
            return -1
        }
        if (a.course.name > b.course.name) {
            return 1
        }
        return 0
    })
    return arrayOfObjects
}

/** Získá z API lekce roztříděné podle skupin. */
export function getLecturesgroupedByCourses(
    id: number,
    isClient: boolean,
): Promise<GroupedObjectsByCourses<LectureType>> {
    const requestLectures = isClient
        ? LectureService.getAllFromClientOrdered(id, false)
        : LectureService.getAllFromGroupOrdered(id, false)
    return requestLectures.then((lectures) => groupObjectsByCourses(lectures))
}

/** Návratový typ pro funkci getDefaultValuesForLecture (a také pro funkci, kterou používá - prepareDefaultValuesForLecture). */
export type DefaultValuesForLecture = {
    course: CourseType | null
    start: Date | ""
}

/** Vrátí zaslaný kurz a start lekce nebo výchozí hodnoty. */
export function prepareDefaultValuesForLecture(
    course: CourseType | null = null,
    start: string | null = "",
): DefaultValuesForLecture {
    return {
        course,
        start: start === "" || start === null ? "" : addDays(new Date(start), 7),
    }
}

/** Vrátí optimální kurz, jehož lekce bude s nejvyšší pravděpodobností přidávána a odhadnutý start lekce. */
export function getDefaultValuesForLecture(
    lecturesGroupedByCourses: GroupedObjectsByCourses<LectureType>,
): DefaultValuesForLecture {
    // nemame co vratit
    if (lecturesGroupedByCourses.length === 0) {
        return prepareDefaultValuesForLecture()
    }
    // chodi na jeden jediny kurz, vyber ho + start posledni lekce
    else if (lecturesGroupedByCourses.length === 1) {
        return prepareDefaultValuesForLecture(
            lecturesGroupedByCourses[0].course,
            lecturesGroupedByCourses[0].objects[0].start,
        )
    }
    // chodi na vice kurzu, vyber ten jehoz posledni lekce je nejpozdeji (preferuj ten s predplacenymi lekcemi)
    else {
        const latestLecturesOfEachCourse: LectureType[] = lecturesGroupedByCourses.map(
            (elem) => elem.objects[0],
        )
        // pro porovnani se vyuziva lexicographical order
        // (ISO pro datum a cas to podporuje, viz https://en.wikipedia.org/wiki/ISO_8601#General_principles)
        let latestLecture = latestLecturesOfEachCourse[0]
        for (const item of latestLecturesOfEachCourse) {
            // uprednostnujeme predplacene lekce, pri jejich nalezeni ihned koncime
            if (item.start === null) {
                latestLecture = item
                break
            }
            // nejedna se o predplacene lekce, srovname ISO stringy `start` a vratime tu pozdejsi
            // (start u latestLecture neni nikdy null - predplacena lekce by cyklus ukoncila vyse)
            latestLecture = (latestLecture.start ?? "") > item.start ? latestLecture : item
        }
        return prepareDefaultValuesForLecture(latestLecture.course, latestLecture.start)
    }
}

/** Vrátí částku ve srozumitelném formátu. */
export function prettyAmount(amount: number): string {
    return amount.toLocaleString(LOCALE_CZ, {
        style: "currency",
        currency: "CZK",
        maximumFractionDigits: 0,
    })
}

/**
 * Barva textu čitelná na zadaném podkladu. Barva kurzu je libovolný uživatelský hex, takže
 * napevno zvolená bílá by na světlých odstínech zmizela — vybírá se proto ta ze dvojice
 * bílá / inkoust, která má proti podkladu vyšší kontrast.
 *
 * Inkoust je `vars.text.primary` ze světlého motivu; jde o podklad v syté barvě kurzu,
 * který je v obou motivech stejný, takže text se schématem měnit nemá.
 */
export function contrastingTextColor(background: CourseType["color"]): string {
    const ink = "#16233a"
    try {
        return chroma.contrast(background, "white") >= chroma.contrast(background, ink)
            ? "#ffffff"
            : ink
    } catch {
        // neplatný hex z API/DB nesmí shodit vykreslení lekce
        return ink
    }
}

/** Vrátí telefonní číslo ve srozumitelném formátu. */
export function prettyPhone(phone: ClientType["phone"]): string {
    if (!phone) {
        return ""
    }
    const numberParts = phone.match(/.{3}/g)
    return numberParts ? numberParts.join(" ") : phone
}

/** Vrátí celé jméno klienta. */
export function clientName(client: ClientType): string {
    return `${client.surname} ${client.firstname}`
}

/** Vrátí trvání kurzu ve srozumitelném formátu. */
export function courseDuration(duration: LectureType["duration"]): string {
    return `Trvání: ${duration} min.`
}

/** Zjistí, jestli jsou všichni členové skupiny aktivní. */
export function areAllMembersActive(memberships: MembershipType[]): boolean {
    return memberships.every((membership) => membership.client.active)
}

/** Vrátí string validní pro použití jako ID elementu. */
export function makeIdFromString(string: string): string {
    return string.replace(/\s+/g, "-")
}

/** Zjistí, jestli je otevřené modální okno. Mantine Modal i Spotlight nastavují aria-modal. */
export function isModalShown(): boolean {
    return document.querySelectorAll('[aria-modal="true"]').length !== 0
}

/**
 * Zjistí, jestli aplikace běží na Apple platformě (macOS/iOS) — klávesové zkratky
 * se tam zobrazují s ⌘ místo Ctrl (`mod` v hotkeys odpovídá ⌘, jinde Ctrl).
 */
export function isApplePlatform(): boolean {
    // `navigator.userAgentData` zatím chybí ve standardních TS typech (experimentální API),
    // `navigator.platform` slouží jen jako fallback heuristika pro starší prohlížeče
    const uaDataPlatform = (navigator as Navigator & { userAgentData?: { platform?: string } })
        .userAgentData?.platform
    return /mac|iphone|ipad|ipod/i.test(uaDataPlatform ?? navigator.platform)
}

/** Vrátí string s velkým počátečním písmenem. */
export function capitalizeString(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

/**
 * Odstraní diakritiku ("Němec" → "Nemec"), aby hledání fungovalo bez ohledu na to, jestli
 * uživatel diakritiku napsal. Stejná technika jako v `admin/static/admin/gdpr.js`
 * (`removeDiacritics`) — tam je vlastní kopie, protože ten skript je plain JS bez importů.
 */
export function removeDiacritics(value: string): string {
    return value.normalize("NFD").replace(/\p{Diacritic}/gu, "")
}

/** Prázdná funkce. */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = (): void => {}

/** Vrátí title pro stránku. */
export function pageTitle(title: string): string {
    const envTitle = !isEnvProduction() ? `${getEnvNameShort()} | ` : ""
    return `${envTitle + title} – ÚPadmin`
}

/** Vrátí true pokud je aktivní klient/skupina „stale" – naposledy měl lekci před více než DAYS_WITHOUT_LECTURE_WARNING dny. Nová entita bez lekce (null) varování nedostane. */
export function isStaleActive(lastLectureDate: string | null): boolean {
    if (!lastLectureDate) {
        return false
    }
    const daysSince = (Date.now() - new Date(lastLectureDate).getTime()) / (1000 * 60 * 60 * 24)
    return daysSince > DAYS_WITHOUT_LECTURE_WARNING
}

/** Vrátí boolean, jestli je zaslaný string URL. */
export function isValidUrl(urlString: string) {
    try {
        return Boolean(new URL(urlString))
    } catch {
        return false
    }
}
