import { RECENT_RECORDS_STORAGE_KEY } from "./constants"
import {
    pruneUnresolvableRecentRecords,
    readRecentRecords,
    rememberRecentRecord,
} from "./recentRecords"

beforeEach(() => {
    localStorage.clear()
})

test("keeps the most recently opened record first", () => {
    rememberRecentRecord({ kind: "client", id: 1 })
    rememberRecentRecord({ kind: "group", id: 2 })

    expect(readRecentRecords()).toEqual([
        { kind: "group", id: 2 },
        { kind: "client", id: 1 },
    ])
})

test("moves an already remembered record to the front instead of duplicating it", () => {
    rememberRecentRecord({ kind: "client", id: 1 })
    rememberRecentRecord({ kind: "group", id: 2 })
    rememberRecentRecord({ kind: "client", id: 1 })

    expect(readRecentRecords()).toEqual([
        { kind: "client", id: 1 },
        { kind: "group", id: 2 },
    ])
})

test("remembers only the last five records", () => {
    for (let id = 1; id <= 7; id++) {
        rememberRecentRecord({ kind: "client", id })
    }

    expect(readRecentRecords()).toEqual([
        { kind: "client", id: 7 },
        { kind: "client", id: 6 },
        { kind: "client", id: 5 },
        { kind: "client", id: 4 },
        { kind: "client", id: 3 },
    ])
})

test("ignores a stored value that is not a list of records", () => {
    localStorage.setItem(RECENT_RECORDS_STORAGE_KEY, "{tohle neni JSON")

    expect(readRecentRecords()).toEqual([])
})

test("drops entries that lost their shape, keeps the rest", () => {
    localStorage.setItem(
        RECENT_RECORDS_STORAGE_KEY,
        JSON.stringify([{ kind: "client", id: 1 }, { kind: "kurz", id: 2 }, { id: 3 }, "nic"]),
    )

    expect(readRecentRecords()).toEqual([{ kind: "client", id: 1 }])
})

describe("pruneUnresolvableRecentRecords", () => {
    test("removes records the predicate rejects, keeps the rest", () => {
        rememberRecentRecord({ kind: "client", id: 1 })
        rememberRecentRecord({ kind: "client", id: 2 })
        rememberRecentRecord({ kind: "client", id: 3 })

        const resolvable = pruneUnresolvableRecentRecords((record) => record.id !== 2)

        expect(resolvable).toEqual([
            { kind: "client", id: 3 },
            { kind: "client", id: 1 },
        ])
        expect(readRecentRecords()).toEqual(resolvable)
    })

    test("does not touch storage when every record is still resolvable", () => {
        rememberRecentRecord({ kind: "client", id: 1 })
        const setItemSpy = vi.spyOn(Storage.prototype, "setItem")

        pruneUnresolvableRecentRecords(() => true)

        expect(setItemSpy).not.toHaveBeenCalled()
        setItemSpy.mockRestore()
    })

    test("reads storage fresh instead of trusting a stale caller-held list", () => {
        // simuluje pripad, kdy paleta drzi zastaraly stav (naposledy nacteny pri
        // otevreni) a mezitim nekde jinde (otevrena karta) pribyl novejsi zaznam,
        // o kterem stav palety jeste nevi — presto ho pruning nesmi ztratit
        rememberRecentRecord({ kind: "client", id: 1 })
        rememberRecentRecord({ kind: "client", id: 2 })

        const resolvable = pruneUnresolvableRecentRecords(() => true)

        expect(resolvable).toEqual([
            { kind: "client", id: 2 },
            { kind: "client", id: 1 },
        ])
    })
})
