import { act, renderHook } from "@testing-library/react"

import { DataTableColumn, useDataTable } from "./useDataTable"

type Row = { id: number; name: string | null; count: number }

const ROWS: Row[] = [
    { id: 1, name: "Alena Nováková", count: 3 },
    { id: 2, name: "Bořek Šťastný", count: 1 },
    { id: 3, name: "Čeněk Zeman", count: 2 },
    { id: 4, name: null, count: 5 },
]

const COLUMNS: DataTableColumn<Row>[] = [
    { key: "name", value: (row) => row.name },
    { key: "count", value: (row) => row.count },
]

const searchIn = (row: Row): (string | null)[] => [row.name]

type Props = { rows: Row[]; resetKey: unknown }

const setup = (rows: Row[] = ROWS, resetKey: unknown = "active") =>
    renderHook(
        (props: Props) =>
            useDataTable<Row>({
                rows: props.rows,
                searchIn,
                columns: COLUMNS,
                initialSortKey: "name",
                resetKey: props.resetKey,
            }),
        { initialProps: { rows, resetKey } },
    )

describe("sorting", () => {
    test("sorts by the initial column ascending, with Czech collation", () => {
        const { result } = setup()

        expect(result.current.rowsOnPage.map((r) => r.name)).toEqual([
            "Alena Nováková",
            "Bořek Šťastný",
            "Čeněk Zeman",
            null,
        ])
    })

    test("null/empty values always sort last, regardless of direction", () => {
        const { result } = setup()

        act(() => result.current.toggleSort("name"))

        expect(result.current.sortDirection).toBe("desc")
        expect(result.current.rowsOnPage.map((r) => r.name)).toEqual([
            "Čeněk Zeman",
            "Bořek Šťastný",
            "Alena Nováková",
            null,
        ])
    })

    test("toggleSort flips direction on the same column, resets to asc on a new one", () => {
        const { result } = setup()

        act(() => result.current.toggleSort("name"))
        expect(result.current.sortKey).toBe("name")
        expect(result.current.sortDirection).toBe("desc")

        act(() => result.current.toggleSort("count"))
        expect(result.current.sortKey).toBe("count")
        expect(result.current.sortDirection).toBe("asc")
        expect(result.current.rowsOnPage.map((r) => r.count)).toEqual([1, 2, 3, 5])
    })
})

describe("search", () => {
    test("filters diacritics-insensitively", () => {
        const { result } = setup()

        act(() => result.current.search("nemec"))
        expect(result.current.rowsOnPage.map((r) => r.name)).toEqual([])

        act(() => result.current.search("novak"))
        expect(result.current.rowsOnPage.map((r) => r.name)).toEqual(["Alena Nováková"])
    })
})

describe("resetKey", () => {
    test("clears query and page when resetKey changes", () => {
        const otherRows: Row[] = [{ id: 10, name: "Someone Else", count: 9 }]
        const { result, rerender } = setup(ROWS, "active")

        act(() => result.current.search("Alena"))
        expect(result.current.rowsOnPage.map((r) => r.name)).toEqual(["Alena Nováková"])

        // simulates ActiveSwitcher flipping tabs: rows AND resetKey change in the same render
        rerender({ rows: otherRows, resetKey: "inactive" })

        expect(result.current.query).toBe("")
        expect(result.current.rowsOnPage.map((r) => r.name)).toEqual(["Someone Else"])
    })

    test("does not reset query when rows change but resetKey stays the same", () => {
        const { result, rerender } = setup(ROWS, "active")

        act(() => result.current.search("Alena"))
        rerender({ rows: [...ROWS, { id: 5, name: "Nová Osoba", count: 0 }], resetKey: "active" })

        expect(result.current.query).toBe("Alena")
    })
})

describe("pagination", () => {
    test("is not paginated at or under the page size", () => {
        const { result } = setup()

        expect(result.current.isPaginated).toBe(false)
        expect(result.current.rowsOnPage).toHaveLength(ROWS.length)
    })

    test("paginates once rows exceed the page size", () => {
        const manyRows: Row[] = Array.from({ length: 60 }, (_, i) => ({
            id: i,
            name: `Row ${i}`,
            count: i,
        }))
        const { result } = setup(manyRows)

        expect(result.current.isPaginated).toBe(true)
        expect(result.current.pageCount).toBe(2)
    })

    test("search() resets to page 1 on its own", () => {
        const manyRows: Row[] = Array.from({ length: 60 }, (_, i) => ({
            id: i,
            name: `Row ${i}`,
            count: i,
        }))
        const { result } = setup(manyRows)

        act(() => result.current.setPage(2))
        expect(result.current.page).toBe(2)

        act(() => result.current.search("Row 1"))
        expect(result.current.page).toBe(1)
    })

    test("clamps a stale page when rows shrink without going through search/sort", () => {
        // mirrors Clients.tsx/Groups.tsx's handleDeactivateAll: rows shrinks while resetKey
        // (active) stays the same, no search/sort involved — safePage must still catch this
        const manyRows: Row[] = Array.from({ length: 60 }, (_, i) => ({
            id: i,
            name: `Row ${i}`,
            count: i,
        }))
        const { result, rerender } = setup(manyRows, "active")

        act(() => result.current.setPage(2))
        expect(result.current.page).toBe(2)
        expect(result.current.query).toBe("")

        // shrink rows directly via rerender, same resetKey, no search()/toggleSort() call
        rerender({ rows: manyRows.slice(0, 10), resetKey: "active" })

        expect(result.current.isPaginated).toBe(false)
        expect(result.current.page).toBe(1)
    })
})
