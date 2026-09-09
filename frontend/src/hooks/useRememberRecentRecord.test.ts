import { renderHook } from "@testing-library/react"

import { readRecentRecords } from "../global/recentRecords"

import { useRememberRecentRecord } from "./useRememberRecentRecord"

beforeEach(() => {
    localStorage.clear()
})

test("remembers the opened card", () => {
    renderHook(() => useRememberRecentRecord("client", 7, true))

    expect(readRecentRecords()).toEqual([{ kind: "client", id: 7 }])
})

test("remembers the newly opened card first when the card changes", () => {
    const { rerender } = renderHook(({ id }) => useRememberRecentRecord("group", id, true), {
        initialProps: { id: 1 },
    })

    rerender({ id: 2 })

    expect(readRecentRecords()).toEqual([
        { kind: "group", id: 2 },
        { kind: "group", id: 1 },
    ])
})

test("does not remember while disabled (record not yet confirmed to exist)", () => {
    renderHook(() => useRememberRecentRecord("client", 7, false))

    expect(readRecentRecords()).toEqual([])
})

test("does not remember an invalid id (e.g. NaN from a non-numeric URL segment)", () => {
    renderHook(() => useRememberRecentRecord("client", Number("abc"), true))

    expect(readRecentRecords()).toEqual([])
})
