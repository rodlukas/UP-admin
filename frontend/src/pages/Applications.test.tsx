import { MantineProvider } from "@mantine/core"
import { onlineManager, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { render, screen } from "@testing-library/react"

import { createQueryClient } from "../api/queryClient"
import ApplicationService from "../api/services/ApplicationService"
import { createTestRouter } from "../testUtils/createTestRouter"

import Applications from "./Applications"

vi.mock("../api/services/ApplicationService", () => ({ default: { getAll: vi.fn() } }))

const getAllMock = vi.mocked(ApplicationService).getAll

async function renderApplications(): Promise<void> {
    const queryClient = createQueryClient()
    // produkční `retry: 1` by chybový stav oddálil o ~1 s; opakování tu není předmětem testu
    queryClient.setQueryDefaults(["applications"], { retry: false })
    const router = await createTestRouter(
        <MantineProvider env="test">
            <Applications />
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
    getAllMock.mockReset()
})

test("shows an empty state when the list really loaded and is empty", async () => {
    getAllMock.mockResolvedValue([])
    await renderApplications()

    expect(await screen.findByText("Žádní zájemci")).toBeInTheDocument()
    expect(screen.queryByText("Zájemce se nepodařilo načíst")).not.toBeInTheDocument()
})

// seznam, který se nenačetl, nesmí vypadat jako prázdný - uživatelka by uvěřila, že žádní
// zájemci nejsou
test("shows a load error when the applications never arrived", async () => {
    getAllMock.mockRejectedValue(new Error("network error"))
    await renderApplications()

    expect(await screen.findByText("Zájemce se nepodařilo načíst")).toBeInTheDocument()
    expect(screen.queryByText("Žádní zájemci")).not.toBeInTheDocument()
})

// offline je dotaz `pending` s `fetchStatus: "paused"`: nic nenačte, ale ani nehlásí chybu
test("shows a load error while offline", async () => {
    onlineManager.setOnline(false)
    getAllMock.mockResolvedValue([])
    await renderApplications()

    expect(await screen.findByText("Zájemce se nepodařilo načíst")).toBeInTheDocument()
    expect(screen.queryByText("Žádní zájemci")).not.toBeInTheDocument()
    expect(getAllMock).not.toHaveBeenCalled()
})
