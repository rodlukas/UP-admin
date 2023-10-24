import { USER_BIRTHDAY, USER_CELEBRATION, USER_NAMEDAY } from "./constants"
import {
    addDays,
    getMonday,
    getSerializedWeek,
    isEqualDate,
    isNotCurrentYear,
    isToday,
    isUserCelebrating,
    prettyDate,
    prettyDateTime,
    prettyDateWithDayYear,
    prettyDateWithDayYearIfDiff,
    prettyDateWithLongDayYear,
    prettyDateWithLongDayYearIfDiff,
    prettyDateWithYear,
    prettyDateWithYearIfDiff,
    prettyTime,
    prettyTimeWithSeconds,
    toISODate,
    toISOTime,
} from "./funcDateTime"

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

describe("add some days to date", () => {
    expect(addDays(new Date(2020, 1, 1), 2)).toStrictEqual(new Date(2020, 1, 3))
    expect(addDays(new Date(2020, 1, 21), -2)).toStrictEqual(new Date(2020, 1, 19))
})

describe("pretty time", () => {
    test("pretty time uses zero padding for one digit minutes", () => {
        expect(prettyTime(new Date(2020, 1, 1, 15, 2, 4))).toBe("15:02")
        expect(prettyTime(new Date(2020, 1, 1, 5, 2, 4))).toBe("5:02")
    })

    test("pretty time doesn't use zero padding for two digit minutes", () => {
        expect(prettyTime(new Date(2020, 1, 1, 15, 22, 4))).toBe("15:22")
        expect(prettyTime(new Date(2020, 1, 1, 5, 22, 4))).toBe("5:22")
    })
})

describe("pretty date without year", () => {
    test("pretty date without year doesn't use zero padding for one digit minutes", () => {
        expect(prettyDate(new Date(2020, 1, 1, 15, 2, 4))).toBe("1. 2.")
    })

    test("pretty date without year doesn't use zero padding for two digit minutes", () => {
        expect(prettyDate(new Date(2020, 10, 10, 15, 22, 4))).toBe("10. 11.")
    })
})

describe("pretty date with year", () => {
    test("pretty date with year doesn't use zero padding for one digit minutes", () => {
        expect(prettyDateWithYear(new Date(2020, 1, 1, 15, 2, 4))).toBe("1. 2. 2020")
    })

    test("pretty date with year doesn't use zero padding for two digit minutes", () => {
        expect(prettyDateWithYear(new Date(2020, 10, 10, 15, 22, 4))).toBe("10. 11. 2020")
    })
})

test("recognizes current year", () => {
    expect(isNotCurrentYear(new Date())).toBe(false)
    expect(isNotCurrentYear(new Date(2010, 1, 1))).toBe(true)
})

test("pretty date with year (if differs from current)", () => {
    const dateWithCurrentYear = new Date()
    dateWithCurrentYear.setDate(1)
    dateWithCurrentYear.setMonth(1)

    expect(prettyDateWithYearIfDiff(new Date(dateWithCurrentYear))).toBe("1. 2.")
    expect(prettyDateWithYearIfDiff(new Date(2010, 1, 1, 15, 2, 4))).toBe("1. 2. 2010")
})

test("pretty date with year and long textual day", () => {
    expect(prettyDateWithLongDayYear(new Date(2020, 1, 3, 15, 2, 4))).toBe("pondělí 3. 2. 2020")
    expect(prettyDateWithLongDayYear(new Date(2010, 1, 2, 15, 2, 4))).toBe("úterý 2. 2. 2010")
})

test("pretty date with year and short textual day", () => {
    expect(prettyDateWithDayYear(new Date(2020, 1, 3, 15, 2, 4))).toBe("po 3. 2. 2020")
    expect(prettyDateWithDayYear(new Date(2010, 1, 2, 15, 2, 4))).toBe("út 2. 2. 2010")
})

test("pretty date with year (if differs from current) and long textual day", () => {
    const dateWithCurrentYear = new Date()
    dateWithCurrentYear.setDate(3)
    dateWithCurrentYear.setMonth(1)
    const nameOfCurDay = Intl.DateTimeFormat("cs-CZ", { weekday: "long" }).format(
        dateWithCurrentYear,
    )

    expect(prettyDateWithLongDayYearIfDiff(dateWithCurrentYear)).toBe(`${nameOfCurDay} 3. 2.`)
    expect(prettyDateWithLongDayYearIfDiff(new Date(2010, 1, 2, 15, 2, 4))).toBe("úterý 2. 2. 2010")
})

describe("pretty date year (if differs from current) and short textual day, possible conversion to single word", () => {
    test("convert date to single word if required", () => {
        const today = new Date()
        const tomorrow = new Date()
        const yesterday = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        yesterday.setDate(yesterday.getDate() - 1)

        expect(prettyDateWithDayYearIfDiff(today, true)).toBe("dnes")
        expect(prettyDateWithDayYearIfDiff(today, false)).not.toBe("dnes")
        expect(prettyDateWithDayYearIfDiff(yesterday, true)).toBe("včera")
        expect(prettyDateWithDayYearIfDiff(yesterday, false)).not.toBe("včera")
        expect(prettyDateWithDayYearIfDiff(tomorrow, true)).toBe("zítra")
        expect(prettyDateWithDayYearIfDiff(tomorrow, false)).not.toBe("zítra")
    })

    test("full date when single word not required", () => {
        const dateWithCurrentYear = new Date()
        dateWithCurrentYear.setDate(3)
        dateWithCurrentYear.setMonth(1)
        const nameOfCurDay = Intl.DateTimeFormat("cs-CZ", { weekday: "short" }).format(
            dateWithCurrentYear,
        )

        expect(prettyDateWithDayYearIfDiff(new Date(dateWithCurrentYear), false)).toBe(
            `${nameOfCurDay} 3. 2.`,
        )
        expect(prettyDateWithDayYearIfDiff(new Date(2010, 1, 3, 15, 2, 4), false)).toBe(
            "st 3. 2. 2010",
        )
    })
})

describe("pretty time with seconds", () => {
    test("pretty time uses zero padding for one digit minutes", () => {
        expect(prettyTimeWithSeconds(new Date(2020, 1, 1, 15, 2, 4))).toBe("15:02:04")
    })

    test("pretty time doesn't use zero padding for two digit minutes", () => {
        expect(prettyTimeWithSeconds(new Date(2020, 1, 1, 15, 22, 14))).toBe("15:22:14")
    })
})

test("pretty date and time with year and short textual day and seconds", () => {
    expect(prettyDateTime(new Date(2020, 1, 3, 15, 2, 4))).toBe("po 3. 2. 2020 15:02:04")
    expect(prettyDateTime(new Date(2010, 1, 2, 15, 2, 4))).toBe("út 2. 2. 2010 15:02:04")
})

test("iso date", () => {
    expect(toISODate(new Date(2020, 1, 3, 15, 2, 4))).toBe("2020-02-03")
    expect(toISODate(new Date(2020, 10, 13, 15, 2, 4))).toBe("2020-11-13")
})

test("iso time", () => {
    expect(toISOTime(new Date(2020, 1, 3, 15, 2, 4))).toBe("15:02")
    expect(toISOTime(new Date(2020, 10, 13, 5, 2, 4))).toBe("05:02")
})

test("get monday", () => {
    expect(getMonday(new Date(2020, 8, 7))).toStrictEqual(new Date(2020, 8, 7))
    expect(getMonday(new Date(2020, 8, 13))).toStrictEqual(new Date(2020, 8, 7))
    expect(getMonday(new Date(2020, 8, 9))).toStrictEqual(new Date(2020, 8, 7))
})

test("serialized week", () => {
    expect(getSerializedWeek(new Date(2020, 8, 7))).toEqual([
        "2020-09-07",
        "2020-09-08",
        "2020-09-09",
        "2020-09-10",
        "2020-09-11",
    ])
    expect(getSerializedWeek(new Date(2020, 8, 9))).toEqual([
        "2020-09-07",
        "2020-09-08",
        "2020-09-09",
        "2020-09-10",
        "2020-09-11",
    ])
})

describe("user's celebrations", () => {
    test("user celebrates birthday", () => {
        expect(isUserCelebrating(new Date(2020, USER_BIRTHDAY.month, USER_BIRTHDAY.date))).toBe(
            USER_CELEBRATION.BIRTHDAY,
        )
    })
    test("user celebrates nothing", () => {
        expect(isUserCelebrating(new Date(2020, 1, 1))).toBe(USER_CELEBRATION.NOTHING)
    })
    test("user celebrates nameday", () => {
        expect(isUserCelebrating(new Date(2020, USER_NAMEDAY.month, USER_NAMEDAY.date))).toBe(
            USER_CELEBRATION.NAMEDAY,
        )
    })
})
