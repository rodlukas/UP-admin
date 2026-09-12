import { MantineProvider } from "@mantine/core"
import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"

import { createQueryClient } from "../api/queryClient"
import ClientService from "../api/services/ClientService"
import GroupService from "../api/services/GroupService"
import LectureService from "../api/services/LectureService"
import { AttendanceStatesContext } from "../contexts/AttendanceStatesContext"
import { createTestRouter } from "../testUtils/createTestRouter"
import { ClientType, LectureType } from "../types/models"

import Card from "./Card"

// Jediné, co testy řídí, jsou lekce pro záložku Analýza - ostatní dotazy karty se předsypou
// do cache (viz `seedCardQueries`), aby karta nezůstala pod kostrou.
vi.mock("../api/services/LectureService", () => ({
    default: {
        getAllFromClientOrdered: vi.fn(),
        getAllFromClientIncludingGroups: vi.fn(),
    },
}))
vi.mock("../api/services/ClientService", () => ({ default: { get: vi.fn() } }))
vi.mock("../api/services/GroupService", () => ({
    default: {
        getAllFromClient: vi.fn(),
        getAllEverFromClient: vi.fn(),
    },
}))

const lecturesAllMock = vi.mocked(LectureService).getAllFromClientIncludingGroups

const CLIENT_ID = 42

const client: ClientType = {
    id: CLIENT_ID,
    active: true,
    email: "",
    note: "",
    phone: "",
    firstname: "Eva",
    surname: "Novakova",
    last_lecture_date: null,
}

const COURSE = { id: 5, name: "Plavání", color: "#f39c12", duration: 30, visible: true }

function createLecture(id: number, start: string | null): LectureType {
    return {
        id,
        course: COURSE,
        start,
        group: null,
        number: 1,
        canceled: false,
        duration: 30,
        attendances: [
            {
                id: id + 500,
                client,
                attendancestate: 1,
                paid: true,
                remind_pay: false,
                note: "",
            },
        ],
    }
}

/** Dotazy karty mimo Analýzu - bez nich by karta zůstala pod celostránkovou kostrou. */
function seedCardQueries(queryClient: QueryClient): void {
    queryClient.setQueryData(["clients", CLIENT_ID], client)
    queryClient.setQueryData(["groups", { client: CLIENT_ID }], [])
    queryClient.setQueryData(["groups", { client: CLIENT_ID, onlyPast: true }], [])
    queryClient.setQueryData(["lectures", { client: CLIENT_ID, asc: false }], [])
}

async function renderCard(): Promise<{ queryClient: QueryClient }> {
    const queryClient = createQueryClient()
    // Produkční klient má `retry: 1`, takže by chybový stav nastal až po ~1s čekání na druhý
    // pokus. Opakování není předmětem těchhle testů - zbytek konfigurace zůstává produkční.
    queryClient.setQueryDefaults(["lectures"], { retry: false })
    seedCardQueries(queryClient)
    const router = await createTestRouter(
        <MantineProvider env="test">
            <AttendanceStatesContext.Provider
                value={{
                    attendancestates: [
                        { id: 1, name: "OK", default: true, excused: false, visible: true },
                        { id: 2, name: "Omluven", default: false, excused: true, visible: true },
                    ],
                    isLoading: false,
                    hasData: true,
                }}>
                <Card id={CLIENT_ID} isClientPage />
            </AttendanceStatesContext.Provider>
        </MantineProvider>,
        { paths: ["/klienti/$id", "/skupiny/$id"] },
    )
    render(
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>,
    )
    return { queryClient }
}

/** Přepne na záložku Analýza - teprve tím se její dotaz vůbec zapne (viz `wasAnalysisOpened`). */
async function openAnalysisTab(): Promise<void> {
    fireEvent.click(await screen.findByRole("tab", { name: "Analýza" }))
}

beforeEach(() => {
    // Obnova online stavu patri sem, ne do `afterEach`: Vitest spousti after-hooky v opacnem
    // poradi registrace, takze ten zdejsi by bezel PRED auto-cleanupem @testing-library —
    // pozastaveny dotaz by se rozjel nad jeste namountovanym stromem (act() warning a volani
    // mocku pripsane cizimu testu).
    onlineManager.setOnline(true)
    lecturesAllMock.mockReset()
    // i `ClientService`: posledni test ho necha trvale odmitat, takze bez resetu by kazdy
    // dalsi pridany test zavisel na tom, ze si klienta predsype do cache
    vi.mocked(ClientService).get.mockReset()
    vi.mocked(GroupService).getAllFromClient.mockResolvedValue([])
    vi.mocked(GroupService).getAllEverFromClient.mockResolvedValue([])
    vi.mocked(LectureService).getAllFromClientOrdered.mockResolvedValue([])
})

// `isPending` by tu byl špatně: offline je dotaz `pending` s `fetchStatus: "paused"`, takže
// by kostra zůstala napořád a chybová větev by byla nedosažitelná
test("shows a skeleton while the analysis lectures are loading", async () => {
    lecturesAllMock.mockReturnValue(new Promise(() => undefined))
    await renderCard()
    await openAnalysisTab()

    await waitFor(() => expect(lecturesAllMock).toHaveBeenCalled())
    // bez tohohle by test prosel i kdyby nacitaci vetev nevykreslila NIC a zalozka zustala
    // trvale prazdna (`data-qa="loading"` drzi `SkeletonShell`, viz Skeletons.tsx)
    expect(screen.getByTestId("loading")).toBeInTheDocument()
    expect(screen.queryByText("Analýzu se nepodařilo načíst")).not.toBeInTheDocument()
    expect(screen.queryByText("Není co analyzovat")).not.toBeInTheDocument()
})

// bez téhle větve by ClientAnalysis dostalo prázdné pole a záložka by zůstala úplně prázdná -
// klient s plnou historií by vypadal stejně jako klient bez jediné lekce
test("shows a load error when the analysis lectures never arrived", async () => {
    lecturesAllMock.mockRejectedValue(new Error("network error"))
    await renderCard()
    await openAnalysisTab()

    expect(await screen.findByText("Analýzu se nepodařilo načíst")).toBeInTheDocument()
})

// úspěšně načtený klient bez jediné DATOVANÉ lekce nesmí skončit prázdným panelem -
// ten je k nerozeznání od rozbitého načtení
test("shows an empty state for a client with no dated lectures", async () => {
    lecturesAllMock.mockResolvedValue([createLecture(1, null)])
    await renderCard()
    await openAnalysisTab()

    expect(await screen.findByText("Není co analyzovat")).toBeInTheDocument()
    expect(screen.queryByText("Analýzu se nepodařilo načíst")).not.toBeInTheDocument()
})

test("renders the analysis summary once the lectures loaded", async () => {
    lecturesAllMock.mockResolvedValue([
        createLecture(1, "2026-05-04T10:00:00"),
        createLecture(2, "2026-05-11T10:00:00"),
    ])
    await renderCard()
    await openAnalysisTab()

    expect(await screen.findByText("Proběhlé")).toBeInTheDocument()
    expect(screen.getByText("Zaplaceno")).toBeInTheDocument()
    expect(screen.queryByText("Není co analyzovat")).not.toBeInTheDocument()
    expect(screen.queryByText("Analýzu se nepodařilo načíst")).not.toBeInTheDocument()
})

// Rozdíl mezi `isPending` a `isLoading` je vidět JEN offline: dotaz je pak `pending`
// s `fetchStatus: "paused"`, takže nikdy nic nenačte. S `isPending` by tu kostra zůstala
// napořád a uživatel by se nedozvěděl, že je odpojený.
test("shows a load error instead of an endless skeleton while offline", async () => {
    onlineManager.setOnline(false)
    lecturesAllMock.mockResolvedValue([])
    await renderCard()
    await openAnalysisTab()

    expect(await screen.findByText("Analýzu se nepodařilo načíst")).toBeInTheDocument()
    // dotaz se offline vůbec nespustil, jen čeká
    expect(lecturesAllMock).not.toHaveBeenCalled()
})

// Bez vlastni chybove vetve by se karta vykreslila jako uspesne nacteny zaznam bez jedine
// lekce (prazdny nadpis + "Zadne lekce") - klient s plnou historii k nerozeznani od
// rozbiteho nacteni, tedy presne ta trida chyb, kterou resi zbytek diffu
test("shows a load error when the client itself never arrived", async () => {
    const queryClient = createQueryClient()
    queryClient.setQueryDefaults(["clients"], { retry: false })
    queryClient.setQueryDefaults(["lectures"], { retry: false })
    queryClient.setQueryDefaults(["groups"], { retry: false })
    vi.mocked(ClientService).get.mockRejectedValue(new Error("boom"))
    const router = await createTestRouter(
        <MantineProvider env="test">
            <AttendanceStatesContext.Provider
                value={{ attendancestates: [], isLoading: false, hasData: true }}>
                <Card id={CLIENT_ID} isClientPage />
            </AttendanceStatesContext.Provider>
        </MantineProvider>,
        { paths: ["/klienti/$id", "/skupiny/$id"] },
    )
    render(
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>,
    )
    expect(await screen.findByText("Klienta se nepodařilo načíst")).toBeInTheDocument()
    expect(screen.queryByText("Žádné lekce")).not.toBeInTheDocument()
})
