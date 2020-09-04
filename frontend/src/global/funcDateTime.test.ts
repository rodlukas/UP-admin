import { addDays, isEqualDate, isToday } from "./funcDateTime"

describe("dates equality", () => {
    test("same dates equality", () => {
        expect(isEqualDate(new Date(2020, 1, 1), new Date(2020, 1, 1))).toBe(true)
    })

    test("different dates equality", () => {
        expect(isEqualDate(new Date(2020, 2, 1), new Date(2020, 1, 1))).toBe(false)
        expect(isEqualDate(new Date(2020, 1, 2), new Date(2020, 1, 1))).toBe(false)
        expect(isEqualDate(new Date(2019, 1, 1), new Date(2020, 1, 1))).toBe(false)
    })
})

describe("today's date", () => {
    test("today's date recognized as today", () => {
        expect(isToday(new Date())).toBe(true)
    })

    test("past/future date recognized as not today", () => {
        expect(isToday(new Date(2020, 1, 1))).toBe(false)
        expect(isToday(new Date(2021, 1, 1))).toBe(false)
    })
})

test("add 2 days to date", () => {
    expect(addDays(new Date(2020, 1, 1), 2)).toStrictEqual(new Date(2020, 1, 3))
})
