import { RECENT_RECORDS_STORAGE_KEY } from "./constants"

export type RecentRecord = {
    kind: "client" | "group"
    id: number
}

/** Kolik naposledy otevřených záznamů si paleta pamatuje. */
const RECENT_RECORDS_LIMIT = 5

const isRecentRecord = (value: unknown): value is RecentRecord => {
    if (typeof value !== "object" || value === null) {
        return false
    }
    const record = value as Partial<RecentRecord>
    return (record.kind === "client" || record.kind === "group") && typeof record.id === "number"
}

/**
 * Naposledy otevřené karty, nejnovější první.
 *
 * Uložený obsah je vstup zvenčí (jiná verze aplikace, ruční zásah do úložiště), proto se
 * čte defenzivně — z rozbitého zápisu se vezme, co dává smysl, zbytek se zahodí. Paleta
 * si radši ukáže míň položek, než aby na rozbitém klíči spadla.
 *
 * `localStorage` samotný taky umí selhat (soukromý mód, zakázaná data pro origin, plná
 * kvóta) — ne jen vrátit `null`, ale rovnou vyhodit výjimku. Bez try/catch by to spadlo
 * z `useEffect` a shodilo celou aplikaci přes `ErrorBoundary` (stejný důvod jako
 * u `color-scheme-init.js`: „ticha degradace").
 */
export const readRecentRecords = (): RecentRecord[] => {
    try {
        const stored = localStorage.getItem(RECENT_RECORDS_STORAGE_KEY)
        if (!stored) {
            return []
        }
        const parsed: unknown = JSON.parse(stored)
        return Array.isArray(parsed) ? parsed.filter(isRecentRecord) : []
    } catch {
        return []
    }
}

const writeRecentRecords = (records: RecentRecord[]): void => {
    try {
        localStorage.setItem(RECENT_RECORDS_STORAGE_KEY, JSON.stringify(records))
    } catch {
        // localStorage nemusi byt dostupne (private mode apod.) — ticha degradace
    }
}

/** Zapíše záznam na první místo; když už v seznamu byl, jen se na první místo přesune. */
export const rememberRecentRecord = (record: RecentRecord): void => {
    const withoutRecord = readRecentRecords().filter(
        (stored) => !(stored.kind === record.kind && stored.id === record.id),
    )
    writeRecentRecords([record, ...withoutRecord].slice(0, RECENT_RECORDS_LIMIT))
}

/**
 * Odstraní ze storage záznamy, které natrvalo nejdou vyřešit na akci (deaktivace,
 * smazání) — jinak by donekonečna zabíraly jedno z pěti míst, i když je paleta nikdy
 * nedokáže zobrazit.
 *
 * Storage se čte čerstvě až tady, ne přes hodnotu propadlou od volajícího: mezi tím, co
 * si volající naposledy přečetl seznam (otevření palety), a tímhle zápisem mohl
 * `rememberRecentRecord` přidat novější záznam odjinud (otevřená karta) — čtení až tady
 * zaručuje, že se nepřepíše.
 */
export const pruneUnresolvableRecentRecords = (
    isResolvable: (record: RecentRecord) => boolean,
): RecentRecord[] => {
    const current = readRecentRecords()
    const resolvable = current.filter(isResolvable)
    if (resolvable.length !== current.length) {
        writeRecentRecords(resolvable)
    }
    return resolvable
}
