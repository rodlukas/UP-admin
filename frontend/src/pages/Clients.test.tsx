import { MantineProvider } from "@mantine/core"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { render, screen } from "@testing-library/react"

import { createQueryClient } from "../api/queryClient"
import { ClientsActiveContext } from "../contexts/ClientsActiveContext"
import { createTestRouter } from "../testUtils/createTestRouter"
import { type ClientActiveType } from "../types/models"

import Clients from "./Clients"

function createClient(id: number, surname: string): ClientActiveType {
    return {
        id,
        active: true,
        email: "",
        note: "",
        phone: "",
        firstname: `Jmeno${id}`,
        surname,
        last_lecture_date: null,
        normalized: [`Jmeno${id}`, surname],
    }
}

/**
 * Vyrenderuje stránku Klienti se zadaným stavem kontextu.
 *
 * Záložka „Aktivní" (výchozí) čte data výhradně z kontextu, takže všechny čtyři stavy jdou
 * nasimulovat jeho hodnotou — bez mockování API vrstvy.
 */
async function renderClients(context: {
    clients: ClientActiveType[]
    isLoading: boolean
    isSuccess: boolean
    hasData: boolean
}): Promise<void> {
    const router = await createTestRouter(
        <MantineProvider env="test">
            <ClientsActiveContext.Provider value={context}>
                <Clients />
            </ClientsActiveContext.Provider>
        </MantineProvider>,
        // jména klientů v tabulce odkazují na kartu
        { paths: ["/klienti/$id"] },
    )
    render(
        <QueryClientProvider client={createQueryClient()}>
            <RouterProvider router={router} />
        </QueryClientProvider>,
    )
}

/** Počet vypsaný vedle nadpisu stránky (`null`, když tam žádný není). */
function headingCount(): string | null {
    const heading = screen.getByRole("heading", { level: 1 })
    const match = /\d+/.exec(heading.textContent ?? "")
    return match ? match[0] : null
}

test("shows a skeleton while the clients are loading", async () => {
    await renderClients({
        clients: [],
        isLoading: true,
        isSuccess: false,
        hasData: false,
    })

    // bez tohohle by test prosel i kdyby se v nacitaci vetvi nevykreslilo NIC
    // (`data-qa="loading"` je marker `SkeletonShell`, kontrakt sdilený s E2E kroky)
    expect(screen.getByTestId("loading")).toBeInTheDocument()
    expect(screen.queryByText("Žádní aktivní klienti")).not.toBeInTheDocument()
    expect(screen.queryByText("Klienty se nepodařilo načíst")).not.toBeInTheDocument()
    // spočítaná nula nad kostrou by tvrdila, že klienti nejsou
    expect(headingCount()).toBeNull()
})

// prázdný seznam znamená něco jiného podle toho, JESTLI SE VŮBEC NAČETL - tenhle rozdíl
// se v téhle větvi ztrácel opakovaně (viz `hasData` v ClientsActiveContext)
test("shows an empty state when the list really loaded and is empty", async () => {
    await renderClients({ clients: [], isLoading: false, isSuccess: true, hasData: true })

    expect(screen.getByText("Žádní aktivní klienti")).toBeInTheDocument()
    expect(screen.queryByText("Klienty se nepodařilo načíst")).not.toBeInTheDocument()
    // nula je tady spočítaná, ne chybějící - a jako spočítaná se má ukázat
    expect(headingCount()).toBe("0")
})

test("shows a load error when the clients never arrived", async () => {
    await renderClients({ clients: [], isLoading: false, isSuccess: false, hasData: false })

    expect(screen.getByText("Klienty se nepodařilo načíst")).toBeInTheDocument()
    expect(screen.queryByText("Žádní aktivní klienti")).not.toBeInTheDocument()
    // chybějící údaj není nula
    expect(headingCount()).toBeNull()
})

// Nejtěsnější místo celého rozlišení: seznam je prázdný, načetl se ÚSPĚŠNĚ, ale následný
// refetch selhal (`isSuccess` je pak false, data z cache ale zůstávají). Rozhodovat se tu
// podle `isSuccess` by z legitimně prázdného seznamu udělalo chybovou hlášku.
test("still calls an empty list empty when a later refetch failed", async () => {
    await renderClients({ clients: [], isLoading: false, isSuccess: false, hasData: true })

    expect(screen.getByText("Žádní aktivní klienti")).toBeInTheDocument()
    expect(screen.queryByText("Klienty se nepodařilo načíst")).not.toBeInTheDocument()
    expect(headingCount()).toBe("0")
})

// TanStack Query si při SELHANÉM REFETCHI data z cache nechá (`status: "error"`, ale `data`
// zůstávají). Kontrola na samotné `isSuccess` proto plnou tabulku schovávala za chybu,
// případně nechala tabulku a schovala jen počet v nadpisu - obojí bylo v minulých kolech
// skutečnou regresí
test("keeps the table and the heading count after a failed refetch", async () => {
    await renderClients({
        clients: [createClient(1, "Novakova"), createClient(2, "Svoboda")],
        isLoading: false,
        isSuccess: false,
        hasData: true,
    })

    expect(screen.getByText(/Novakova/)).toBeInTheDocument()
    expect(screen.getByText(/Svoboda/)).toBeInTheDocument()
    expect(screen.queryByText("Klienty se nepodařilo načíst")).not.toBeInTheDocument()
    expect(headingCount()).toBe("2")
})

// Přepínač Aktivní/Neaktivní musí zůstat ve VŠECH stavech - z prázdného ani chybového
// stavu se uživatel jinak nemá jak dostat jinam než přes menu. Jeden stav by nestačil:
// schovat přepínač jen v prázdné nebo jen v načítací větvi by testem prošlo.
test.each([
    ["načítání", { clients: [], isLoading: true, isSuccess: false, hasData: false }],
    ["prázdný seznam", { clients: [], isLoading: false, isSuccess: true, hasData: true }],
    ["chyba načtení", { clients: [], isLoading: false, isSuccess: false, hasData: false }],
])("keeps the active/inactive switcher available — %s", async (_label, context) => {
    await renderClients(context)

    expect(screen.getByText("Neaktivní")).toBeInTheDocument()
})
