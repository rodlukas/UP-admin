import { configure } from "@testing-library/dom"
import "@testing-library/jest-dom/vitest"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"

import * as data from "./__mocks__/data.json"

// Na Node >= 22 stini globalni (experimentalni) `localStorage` implementaci z jsdom a bez
// prepinace --localstorage-file je `undefined` — testy pracujici s ulozenym barevnym schematem
// i Token.get() by pak padaly na TypeError. Vlastni in-memory shim drzi chovani stejne
// na vsech verzich Node.
if (!window.localStorage) {
    const store = new Map<string, string>()
    Object.defineProperty(window, "localStorage", {
        configurable: true,
        value: {
            getItem: (key: string) => store.get(key) ?? null,
            setItem: (key: string, value: string) => void store.set(key, String(value)),
            removeItem: (key: string) => void store.delete(key),
            clear: () => store.clear(),
            key: (index: number) => Array.from(store.keys())[index] ?? null,
            get length() {
                return store.size
            },
        } satisfies Storage,
    })
}

// jsdom nepodporuje matchMedia, ktere pouziva MantineProvider pro detekci color scheme
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    }),
})

// jsdom neimplementuje scrollIntoView, ktery vola napr. Mantine Spotlight pri oznaceni akce
window.HTMLElement.prototype.scrollIntoView = function (): void {
    // no-op
}

// jsdom neimplementuje window.scrollTo (Mantine ho vola pri zavreni modalu/spotlightu) —
// no-op shim potlacuje "Not implemented" stderr sum
window.scrollTo = (() => {
    // no-op
}) as typeof window.scrollTo

// jsdom neimplementuje ResizeObserver, ktery pouziva napr. Mantine ScrollArea
window.ResizeObserver ??= class {
    observe(): void {
        // no-op
    }

    unobserve(): void {
        // no-op
    }

    disconnect(): void {
        // no-op
    }
}

configure({ testIdAttribute: "data-qa" })

export const handlers = [
    http.get("/api/v1/lectures/", () => {
        return HttpResponse.json(data.lectures)
    }),
]

export const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
