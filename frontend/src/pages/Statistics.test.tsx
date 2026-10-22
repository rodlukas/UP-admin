import { MantineProvider } from "@mantine/core"
import { onlineManager, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { fireEvent, render, screen } from "@testing-library/react"

import { createQueryClient } from "../api/queryClient"
import StatisticsService from "../api/services/StatisticsService"
import { createTestRouter } from "../testUtils/createTestRouter"
import { type StatisticsType } from "../types/models"

import Statistics from "./Statistics"

vi.mock("../api/services/StatisticsService", () => ({ default: { get: vi.fn() } }))

const getMock = vi.mocked(StatisticsService).get

async function renderStatistics(): Promise<void> {
    const queryClient = createQueryClient()
    // produkční `retry: 1` by chybový stav oddálil o ~1 s; opakování tu není předmětem testu
    queryClient.setQueryDefaults(["stats"], { retry: false })
    const router = await createTestRouter(
        <MantineProvider env="test">
            <Statistics />
        </MantineProvider>,
    )
    render(
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>,
    )
}

beforeEach(() => {
    // obnova online stavu patří sem, ne do `afterEach` - viz stejný hook v Card.test.tsx
    onlineManager.setOnline(true)
    getMock.mockReset()
})

test("shows a skeleton while the statistics are loading", async () => {
    getMock.mockReturnValue(new Promise(() => undefined))
    await renderStatistics()

    expect(await screen.findByTestId("loading")).toBeInTheDocument()
    expect(screen.queryByText("Statistiky se nepodařilo načíst")).not.toBeInTheDocument()
})

// bez chybové větve by stránka zůstala na kostře, dokud po 25 s nezasáhne pojistka
// `SkeletonShell` - a ta radí obnovit stránku i tehdy, když API jen vrátilo chybu
test("shows a load error when the statistics never arrived", async () => {
    getMock.mockRejectedValue(new Error("network error"))
    await renderStatistics()

    expect(await screen.findByText("Statistiky se nepodařilo načíst")).toBeInTheDocument()
    expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
    // přepínač roku zůstává - jinak by se z neúspěšného roku nešlo vrátit bez obnovení stránky
    expect(screen.getByRole("radio", { name: "Celkem" })).toBeInTheDocument()
})

// offline je dotaz `pending` s `fetchStatus: "paused"`: nic nenačte, ale ani nehlásí chybu
test("shows a load error while offline", async () => {
    onlineManager.setOnline(false)
    getMock.mockReturnValue(new Promise(() => undefined))
    await renderStatistics()

    expect(await screen.findByText("Statistiky se nepodařilo načíst")).toBeInTheDocument()
    expect(getMock).not.toHaveBeenCalled()
})

const STATISTICS: StatisticsType = {
    clients: { total: 0, active: 0, inactive: 0, without_lectures: 0 },
    groups: { total: 0, active: 0, inactive: 0 },
    lectures: {
        not_happened_count: 0,
        canceled_count: 0,
        canceled_rate: 0,
        excused_not_happened_count: 0,
        total: 0,
        individual: 0,
        group: 0,
        total_minutes: 0,
        available_years: [2024, 2023],
        by_course: [],
        by_year_course: [],
        by_year: [],
        top_clients: [],
        top_groups: [],
        by_month: [],
    },
}

// po chybě načtení jednoho roku musí jít přepnout na jiný - roky jsou jen v načtených datech
test("keeps the loaded years in the switcher after a year fails to load", async () => {
    getMock.mockImplementation((filters) =>
        filters?.year === 2023
            ? Promise.reject(new Error("network error"))
            : Promise.resolve(STATISTICS),
    )
    await renderStatistics()

    fireEvent.click(await screen.findByRole("radio", { name: "2023" }))

    expect(await screen.findByText("Statistiky se nepodařilo načíst")).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "2024" })).toBeInTheDocument()
})
