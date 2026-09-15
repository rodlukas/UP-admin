import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { act, render, screen, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"

import * as data from "../../__mocks__/data.json"
import MockContexts from "../../__mocks__/MockContexts"
import { server } from "../../vitest.setup"
import { createQueryClient } from "../api/queryClient"
import { createTestRouter } from "../testUtils/createTestRouter"

import DashboardDay, { HIGHLIGHT_DURATION_MS } from "./DashboardDay"
import * as styles from "./DashboardDay.css"

/** Vykreslí sloupec dne na URL se zvýrazňovacím parametrem a vrátí router i cílovou lekci. */
async function renderWithHighlightedLecture() {
    const queryClient = createQueryClient()
    const router = await createTestRouter(
        <MockContexts>
            <DashboardDay date="2020-09-09" withoutWaiting={true} source="diary" />
        </MockContexts>,
        { path: "/?lecture=88" },
    )
    render(
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>,
    )
    const items = await screen.findAllByTestId("lecture")
    const lecture = items.find((item) => item.id === "lecture-88")
    // vlastni assert, jinak by chybejici lekce spadla az na `toHaveClass(undefined)`
    expect(lecture, "lekce s id 88 mezi vykreslenymi lekcemi neni").toBeDefined()
    return { router, lecture: lecture! }
}

test("dashboard day shows lectures for a specific date", async () => {
    // Sdílený handler ve `vitest.setup.ts` ignoruje `?date` a vrací tytéž lekce na cokoliv,
    // takže by tenhle test prošel i se sloupcem, který si vyžádá úplně jiný den. Tady proto
    // odpovídá jen dotaz na to datum, které komponenta dostala.
    const requestedDates: string[] = []
    server.use(
        http.get("/api/v1/lectures/", ({ request }) => {
            const date = new URL(request.url).searchParams.get("date") ?? ""
            requestedDates.push(date)
            return HttpResponse.json(date === "2020-09-09" ? data.lectures : [])
        }),
    )
    const queryClient = createQueryClient()
    const router = await createTestRouter(
        <MockContexts>
            <DashboardDay date="2020-09-09" withoutWaiting={true} source="dashboard" />
        </MockContexts>,
    )
    render(
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>,
    )
    await screen.findAllByTestId("loading")
    const items = await screen.findAllByTestId("lecture")
    expect(items.length).toBe(2)
    expect(requestedDates).toContain("2020-09-09")
})

test("a lecture matching the ?lecture= search param scrolls into view, highlights, and clears itself", async () => {
    // `finally`, ne úklid na konci těla: `scrollIntoView` je shim na sdíleném prototypu
    // (vitest.setup.ts) a při selhání kteréhokoliv assertu níž by tam špeh zůstal viset
    // i pro zbytek souboru.
    const scrollIntoViewSpy = vi.spyOn(window.HTMLElement.prototype, "scrollIntoView")
    try {
        const { router, lecture } = await renderWithHighlightedLecture()

        expect(lecture).toHaveClass(styles.lectureHighlighted)
        expect(scrollIntoViewSpy).toHaveBeenCalledWith(
            expect.objectContaining({ behavior: "smooth", block: "center" }),
        )

        // "search: {}" po nalezení lekce (`DashboardDay.tsx`) — jinak by refresh/proklik týdnů
        // zvýraznění pořád dokola spouštěl znovu.
        await waitFor(() => {
            expect(router.state.location.search).toEqual({})
        })
    } finally {
        scrollIntoViewSpy.mockRestore()
    }
})

test("the highlight fades out on its own after HIGHLIGHT_DURATION_MS", async () => {
    // `shouldAdvanceTime` je nutné: časovače musí být falešné už při renderu (jinak by
    // `setTimeout` zvýraznění vznikl jako skutečný a nešel přetočit), ale zároveň musí
    // plynout reálný čas, jinak by nedoběhl dotaz přes msw.
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
        const { lecture } = await renderWithHighlightedLecture()
        expect(lecture).toHaveClass(styles.lectureHighlighted)

        act(() => {
            vi.advanceTimersByTime(HIGHLIGHT_DURATION_MS)
        })
        expect(lecture).not.toHaveClass(styles.lectureHighlighted)
    } finally {
        vi.useRealTimers()
    }
})
