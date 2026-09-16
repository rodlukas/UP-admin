import ReactGA from "react-ga4"

// jsdom (viz `environment` ve vitest.config.ts) `location` vždycky definuje jako vlastní
// vlastnost; kdyby ne, je rozbité prostředí, ne test
const originalLocation = Object.getOwnPropertyDescriptor(globalThis, "location")!

/**
 * Postaví handler, kterým `initAnalytics` hlásí zobrazení stránky, a sbírá odeslané cesty.
 *
 * `resetModules` + dynamický import jsou nutné: `initialized` i `lastPagePath` jsou modulový
 * stav `analytics.ts`, který nic neresetuje. Bez čerstvého modulu by si testy ten stav
 * předávaly a procházely jen v jednom konkrétním pořadí — první test vložený doprostřed,
 * `-t` filtr nebo náhodné pořadí by je rozbily.
 */
async function setupAnalytics() {
    vi.resetModules()
    const { initAnalytics } = await import("./analytics")

    const sent: string[] = []
    vi.spyOn(ReactGA, "initialize").mockImplementation(() => undefined)
    vi.spyOn(ReactGA, "send").mockImplementation((payload) => {
        sent.push((payload as { page_path: string }).page_path)
    })

    let resolved: (() => void) | undefined
    initAnalytics("G-TEST12345", (handler) => {
        resolved = handler
    })

    /** Simuluje `onResolved` routeru na dané URL. */
    const visit = (url: string): void => {
        const [pathname, search] = url.split("?")
        Object.defineProperty(globalThis, "location", {
            configurable: true,
            value: { pathname, search: search === undefined ? "" : `?${search}`, hostname: "x" },
        })
        resolved?.()
    }
    return { sent, visit }
}

afterEach(() => {
    vi.restoreAllMocks()
    // `visit()` výš přepisuje `globalThis.location` prostým objektem — bez vrácení zpět by
    // ho dostal rozbité každý další test v tomhle souboru, který by chtěl něco vykreslit.
    // Vrací se celý původní deskriptor, ne jen hodnota: `defineProperty` se samotným `value`
    // nechá vlastnost nezapisovatelnou a nevyčíslitelnou, tedy pořád rozbitou, jen jinak.
    Object.defineProperty(globalThis, "location", originalLocation)
})

test("the transient ?lecture= param is kept out of the reported page path", async () => {
    const { sent, visit } = await setupAnalytics()

    // proklik z "Nejbližší lekce": router vyřeší trasu s parametrem a teprve po doběhnutí
    // dotazu si ho diář uklidí (`clearLectureHighlight`) — jsou to dva `onResolved` na jedné
    // stránce. Bez odfiltrování by z toho byly dva pohledy a interní id lekce v GA4 URL.
    visit("/diar/2026/9/14?lecture=88")
    visit("/diar/2026/9/14")

    expect(sent).toEqual(["/diar/2026/9/14"])
})

test("repeated resolves of the same page are reported once", async () => {
    const { sent, visit } = await setupAnalytics()

    // dvě vyřešení trasy na téže stránce (viz `analytics.ts`) se musí počítat jednou
    visit("/prehled")
    visit("/prehled")

    expect(sent).toEqual(["/prehled"])
})

test("other search params stay part of the page path", async () => {
    const { sent, visit } = await setupAnalytics()

    visit("/klienti?aktivni=1")
    visit("/klienti?aktivni=1&lecture=88")

    // druhá návštěva se liší jen přechodným parametrem, takže je to pořád tatáž stránka
    expect(sent).toEqual(["/klienti?aktivni=1"])
})

test("a real page change is still reported", async () => {
    const { sent, visit } = await setupAnalytics()

    visit("/prehled")
    visit("/diar/2026/9/14")

    expect(sent).toEqual(["/prehled", "/diar/2026/9/14"])
})
