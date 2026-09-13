import { MantineProvider } from "@mantine/core"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { render, screen } from "@testing-library/react"

import { createQueryClient } from "../api/queryClient"
import { GroupsActiveContext } from "../contexts/GroupsActiveContext"
import { createTestRouter } from "../testUtils/createTestRouter"
import { type GroupType } from "../types/models"

import Groups from "./Groups"

function createGroup(id: number, name: string): GroupType {
    return {
        id,
        name,
        memberships: [],
        active: true,
        course: { id: 5, name: "Plavání", color: "#f39c12", duration: 30, visible: true },
        last_lecture_date: null,
    }
}

/**
 * Vyrenderuje stránku Skupiny se zadaným stavem kontextu — stejný vzor jako u Klientů
 * (Clients.test.tsx), obě stránky mají tutéž třívětvou logiku obsahu.
 */
async function renderGroups(context: {
    groups: GroupType[]
    isLoading: boolean
    isSuccess: boolean
    hasData: boolean
}): Promise<void> {
    const router = await createTestRouter(
        <MantineProvider env="test">
            <GroupsActiveContext.Provider value={context}>
                <Groups />
            </GroupsActiveContext.Provider>
        </MantineProvider>,
        // názvy skupin v tabulce odkazují na kartu
        { paths: ["/skupiny/$id"] },
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

test("shows a skeleton while the groups are loading", async () => {
    await renderGroups({
        groups: [],
        isLoading: true,
        isSuccess: false,
        hasData: false,
    })

    // bez tohohle by test prosel i kdyby se v nacitaci vetvi nevykreslilo NIC
    // (`data-qa="loading"` je marker `SkeletonShell`, kontrakt sdilený s E2E kroky)
    expect(screen.getByTestId("loading")).toBeInTheDocument()
    expect(screen.queryByText("Žádné aktivní skupiny")).not.toBeInTheDocument()
    expect(screen.queryByText("Skupiny se nepodařilo načíst")).not.toBeInTheDocument()
    expect(headingCount()).toBeNull()
})

test("shows an empty state when the list really loaded and is empty", async () => {
    await renderGroups({ groups: [], isLoading: false, isSuccess: true, hasData: true })

    expect(screen.getByText("Žádné aktivní skupiny")).toBeInTheDocument()
    expect(headingCount()).toBe("0")
})

test("shows a load error when the groups never arrived", async () => {
    await renderGroups({ groups: [], isLoading: false, isSuccess: false, hasData: false })

    expect(screen.getByText("Skupiny se nepodařilo načíst")).toBeInTheDocument()
    expect(screen.queryByText("Žádné aktivní skupiny")).not.toBeInTheDocument()
    expect(headingCount()).toBeNull()
})

// prázdný seznam, který se ÚSPĚŠNĚ načetl a teprve pak selhal refetch — rozhodovat se tu
// podle `isSuccess` by z legitimně prázdného seznamu udělalo chybovou hlášku
test("still calls an empty list empty when a later refetch failed", async () => {
    await renderGroups({ groups: [], isLoading: false, isSuccess: false, hasData: true })

    expect(screen.getByText("Žádné aktivní skupiny")).toBeInTheDocument()
    expect(screen.queryByText("Skupiny se nepodařilo načíst")).not.toBeInTheDocument()
    expect(headingCount()).toBe("0")
})

// selhaný refetch nechává data v cache, takže tabulka i počet musí zůstat
test("keeps the table and the heading count after a failed refetch", async () => {
    await renderGroups({
        groups: [createGroup(1, "Žabky"), createGroup(2, "Rybky")],
        isLoading: false,
        isSuccess: false,
        hasData: true,
    })

    expect(screen.getByText("Žabky")).toBeInTheDocument()
    expect(screen.getByText("Rybky")).toBeInTheDocument()
    expect(screen.queryByText("Skupiny se nepodařilo načíst")).not.toBeInTheDocument()
    expect(headingCount()).toBe("2")
})

// Přepínač Aktivní/Neaktivní musí zůstat ve VŠECH stavech — z prázdného ani chybového stavu
// se uživatel jinak nemá jak dostat jinam než přes menu. Zrcadlo téhož testu u Klientů
// (Clients.test.tsx); jeden stav by nestačil, schovat přepínač jen v jedné větvi by prošlo.
test.each([
    ["načítání", { groups: [], isLoading: true, isSuccess: false, hasData: false }],
    ["prázdný seznam", { groups: [], isLoading: false, isSuccess: true, hasData: true }],
    ["chyba načtení", { groups: [], isLoading: false, isSuccess: false, hasData: false }],
])("keeps the active/inactive switcher available — %s", async (_label, context) => {
    await renderGroups(context)

    expect(screen.getByText("Neaktivní")).toBeInTheDocument()
})
