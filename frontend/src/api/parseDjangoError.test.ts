import { AxiosError } from "axios"

import { parseDjangoError } from "./parseDjangoError"

function createError(responseBody: unknown): AxiosError {
    return { request: { response: JSON.stringify(responseBody) } } as unknown as AxiosError
}

describe("parseDjangoError", () => {
    test("returns null when the error has no request", () => {
        expect(parseDjangoError({} as AxiosError)).toBeNull()
    })

    test("returns null when the response is not valid JSON", () => {
        expect(parseDjangoError({ request: { response: "not json" } } as AxiosError)).toBeNull()
    })

    test("parses a single-object field error", () => {
        const error = createError({ start: ["Toto pole je povinné."] })
        expect(parseDjangoError(error)).toEqual({ start: "Toto pole je povinné." })
    })

    test("parses non_field_errors", () => {
        const error = createError({ non_field_errors: ["Lekce se překrývá."] })
        expect(parseDjangoError(error)).toBe("Lekce se překrývá.")
    })

    test("parses detail", () => {
        const error = createError({ detail: "Metoda PUT není povolena." })
        expect(parseDjangoError(error)).toBe("Metoda PUT není povolena.")
    })

    // DRF < 3.18: hromadné vytváření (many=True) vrací pole, prázdné objekty za validní
    // položky, chybové položky jsou stejné - vezme se první prvek s chybou.
    test("parses legacy bulk-create error format (array, DRF < 3.18)", () => {
        const error = createError([
            { start: ["Toto pole je povinné."] },
            { start: ["Toto pole je povinné."] },
        ])
        expect(parseDjangoError(error)).toEqual({ start: "Toto pole je povinné." })
    })

    // DRF >= 3.18: hromadné vytváření vrací objekt indexovaný pořadím, jen pro
    // nevalidní položky (viz encode/django-rest-framework#9837).
    test("parses bulk-create error format (index-keyed object, DRF >= 3.18)", () => {
        const bulkError: Record<string, unknown> = {}
        bulkError[1] = { start: ["Toto pole je povinné."] }
        bulkError[3] = { start: ["Toto pole je povinné."] }
        expect(parseDjangoError(createError(bulkError))).toEqual({
            start: "Toto pole je povinné.",
        })
    })
})
