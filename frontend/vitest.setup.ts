import "@testing-library/jest-dom/vitest"
import { configure } from "@testing-library/dom"

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
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import * as data from "./__mocks__/data.json"

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
