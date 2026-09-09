import * as React from "react"

import { removeDiacritics } from "../global/utils"

/** Směr řazení sloupce. */
export type SortDirection = "asc" | "desc"

/** Definice řaditelného sloupce — klíč a hodnota, podle které se řadí. */
export type DataTableColumn<T> = {
    key: string
    value: (row: T) => string | number | null | undefined
}

/** Od kolika řádků stránkovat. */
const PAGE_SIZE = 50

type Options<T> = {
    /** Všechny řádky (už profiltrované podle stavu aktivní/neaktivní). */
    rows: T[]
    /** Texty, ve kterých hledá vyhledávání nad tabulkou. */
    searchIn: (row: T) => (string | null | undefined)[]
    /** Řaditelné sloupce. */
    columns: DataTableColumn<T>[]
    /** Sloupec, podle kterého je tabulka seřazená na začátku. */
    initialSortKey: string
}

/**
 * Hledání, řazení a stránkování pro tabulky seznamů (Klienti, Skupiny).
 *
 * Řadí se přes `localeCompare` s českou lokalizací — bez ní se `Č`, `Ř` a `Š` řadí
 * až za `Z` a seznam jmen vypadá rozbitě.
 *
 * Stránkování se zapíná až nad `PAGE_SIZE` řádků, ne vždycky: krátký seznam se
 * stránkovat nemá. E2E kroky (`tests/ui_steps/helpers.py`, `_paginated_elements`)
 * počítají a hledají přes všechny stránky, ne jen tu aktuální.
 */
export function useDataTable<T>({ rows, searchIn, columns, initialSortKey }: Options<T>) {
    const [query, setQuery] = React.useState("")
    /**
     * Klíč a směr drží **jeden stav**, ne dva. Přepnutí směru vychází z právě řazeného
     * sloupce, takže se dvěma stavy by se `setSortDirection` muselo volat zevnitř updateru
     * `setSortKey` — a ten musí být čistá funkce: React ho volá eagerly a ve StrictMode
     * (i při concurrent re-renderu) znovu, takže by se směr překlopil dvakrát a klik na
     * aktivní hlavičku by viditelně nedělal nic.
     */
    const [sort, setSort] = React.useState<{ key: string; direction: SortDirection }>({
        key: initialSortKey,
        direction: "asc",
    })
    const [page, setPage] = React.useState(1)

    // Přepnutí aktivní/neaktivní (`ActiveSwitcher`) posílá úplně jinou `rows` — hledaný
    // výraz i stránka z předchozího seznamu by jinak přežily na seznam, pro který nikdy
    // nebyly napsané (a při shodě nuly by tabulka ukázala "Nic nenalezeno" nad neprázdným
    // seznamem). Efekt cílí na REFERENCI `rows`, ne na její obsah/délku: React Query
    // (`structuralSharing`) vrací stejnou referenci pro hluboce shodná data, takže obyčejný
    // background refetch beze změny obsahu tenhle efekt nespustí a rozepsané hledání
    // nezmizí jen kvůli refetchi na pozadí.
    React.useEffect(() => {
        setQuery("")
        setPage(1)
    }, [rows])

    const { key: sortKey, direction: sortDirection } = sort

    const filtered = React.useMemo(() => {
        // bez skladani diakritiky ("nemec" by nenaslo "Němec") by se hledani v tabulce
        // rozchazelo s paletou prikazu (AppSpotlight pouziva fuse.js s `ignoreDiacritics`)
        const needle = removeDiacritics(query.trim().toLocaleLowerCase("cs"))
        if (!needle) {
            return rows
        }
        return rows.filter((row) =>
            searchIn(row).some((value) =>
                removeDiacritics((value ?? "").toLocaleLowerCase("cs")).includes(needle),
            ),
        )
    }, [rows, query, searchIn])

    const sorted = React.useMemo(() => {
        const column = columns.find((c) => c.key === sortKey)
        if (!column) {
            return filtered
        }
        const factor = sortDirection === "asc" ? 1 : -1
        // `null`, `undefined` a `""` se pro razeni pocitaji za stejne "prazdno" — bez
        // sjednoceni by `left = null, right = ""` i `left = "", right = null` spadly
        // do stejne vetve (obe vraci `1`), coz neni antisymetricke a nad vice nez 22
        // radky (TimSort merguje, ne jen insertion sort) davalo nedeterministicke poradi
        const isEmpty = (value: string | number | null | undefined): boolean =>
            value === null || value === undefined || value === ""
        return [...filtered].sort((a, b) => {
            const left = column.value(a)
            const right = column.value(b)
            const leftEmpty = isEmpty(left)
            const rightEmpty = isEmpty(right)
            // prazdne hodnoty vzdycky dolu, at nezanesou zacatek seznamu
            if (leftEmpty && rightEmpty) {
                return 0
            }
            if (leftEmpty) {
                return 1
            }
            if (rightEmpty) {
                return -1
            }
            if (typeof left === "number" && typeof right === "number") {
                return (left - right) * factor
            }
            return String(left).localeCompare(String(right), "cs") * factor
        })
    }, [filtered, columns, sortKey, sortDirection])

    const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
    // filtrovani nebo zmena razeni muze zkratit seznam pod aktualni stranku
    const safePage = Math.min(page, pageCount)
    const isPaginated = sorted.length > PAGE_SIZE
    const rowsOnPage = isPaginated
        ? sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
        : sorted

    const toggleSort = React.useCallback((key: string): void => {
        setPage(1)
        setSort((prev) =>
            prev.key === key
                ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
                : { key, direction: "asc" },
        )
    }, [])

    const search = React.useCallback((value: string): void => {
        setPage(1)
        setQuery(value)
    }, [])

    return {
        query,
        search,
        sortKey,
        sortDirection,
        toggleSort,
        page: safePage,
        setPage,
        pageCount,
        isPaginated,
        rowsOnPage,
        filteredCount: sorted.length,
    }
}

/**
 * Předej Mantine `Pagination` jako `getControlProps` — přidá `data-qa="pagination_next"`
 * na šipku další stránky. E2E kroky (`tests/ui_steps/helpers.py`, `_paginated_pages`) ji
 * potřebují jako stabilní hák: čísla stránek uprostřed delšího seznamu Mantine schová za
 * výpustku (`siblings: 1`), ale šipka zůstává klikatelná bez ohledu na to, co je vidět.
 */
export const paginationControlProps = (
    control: "first" | "previous" | "last" | "next",
): Record<string, string> => (control === "next" ? { "data-qa": "pagination_next" } : {})
