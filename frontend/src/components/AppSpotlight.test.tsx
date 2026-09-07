import { MantineProvider } from "@mantine/core"
import { spotlight } from "@mantine/spotlight"
import { RouterProvider } from "@tanstack/react-router"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"

import { trackEvent } from "../analytics"
import { ClientsActiveContext } from "../contexts/ClientsActiveContext"
import { GroupsActiveContext } from "../contexts/GroupsActiveContext"
import { rememberRecentRecord } from "../global/recentRecords"
import { createTestRouter } from "../testUtils/createTestRouter"
import { ClientActiveType, GroupType } from "../types/models"

import AppSpotlight from "./AppSpotlight"
import { courseBandVars } from "./CourseName.css"

/** Z `var(--x)` udělá `--x`, aby se dala přečíst přes `style.getPropertyValue`. */
const cssVarName = (cssVar: string): string => cssVar.replace(/^var\((.+)\)$/, "$1")

vi.mock("../analytics", () => ({
    trackEvent: vi.fn(),
}))

function createClient(
    id: number,
    firstname: string,
    surname: string,
    normalized: string[],
): ClientActiveType {
    return {
        id,
        active: true,
        email: "",
        note: "",
        phone: "",
        firstname,
        surname,
        last_lecture_date: null,
        normalized,
    }
}

// poradi ve zdrojovem poli je zamerne OPACNE nez relevance pro dotaz "rod":
// slaba fuzzy shoda ("Robeš") je prvni, presna shoda ("Rod") az druha
const clients: ClientActiveType[] = [
    createClient(1, "Radim", "Robeš", ["Radim", "Robes"]),
    createClient(2, "Pavels", "Rod", ["Pavels", "Rod"]),
    createClient(3, "Eva", "Žáková", ["Eva", "Zakova"]),
]

const groups: GroupType[] = [
    {
        id: 21,
        name: "Žabky",
        memberships: [],
        active: true,
        course: { id: 5, name: "Plavání", color: "#f39c12", duration: 30, visible: true },
        last_lecture_date: null,
    },
]

type TestRouter = Awaited<ReturnType<typeof createTestRouter>>

async function renderAppSpotlight(): Promise<{ router: TestRouter }> {
    const router = await createTestRouter(
        <MantineProvider env="test">
            <ClientsActiveContext.Provider value={{ clients, isLoading: false, isSuccess: true }}>
                <GroupsActiveContext.Provider value={{ groups, isLoading: false, isSuccess: true }}>
                    <AppSpotlight />
                </GroupsActiveContext.Provider>
            </ClientsActiveContext.Provider>
        </MantineProvider>,
        // paleta na kartu naviguje, router ji tedy musí znát
        { paths: ["/klienti/$id"] },
    )
    render(<RouterProvider router={router} />)
    return { router }
}

const getSearchInput = async (): Promise<HTMLElement> =>
    await screen.findByRole("textbox", { name: "Globální vyhledávání" })

async function openSpotlight(): Promise<HTMLElement> {
    act(() => {
        spotlight.open()
    })
    return await getSearchInput()
}

/** Vrátí texty labelů aktuálně zobrazených akcí (v pořadí vykreslení). */
function getActionLabels(): string[] {
    return Array.from(document.querySelectorAll(".mantine-Spotlight-actionLabel")).map(
        (label) => label.textContent ?? "",
    )
}

/** Vrátí popisky skupin akcí - Spotlight je renderuje přes CSS proměnnou, ne jako text. */
function getGroupLabels(): string[] {
    return Array.from(
        document.querySelectorAll<HTMLElement>(".mantine-Spotlight-actionsGroup"),
    ).map((group) => group.style.getPropertyValue("--spotlight-label"))
}

beforeEach(() => {
    vi.mocked(trackEvent).mockClear()
    // naposledy otevřené žijí v localStorage a mezi testy by protekly
    localStorage.clear()
})

afterEach(async () => {
    // store spotlightu je globalni modulovy singleton - dotaz i stav otevreni by jinak
    // protekly do dalsiho testu (s env="test" se nevola onExited, ktery dotaz cisti);
    // dotaz se musi vycistit i po testech, ktere spotlight samy zavrely - proto
    // se nejdriv (znovu) otevre
    act(() => {
        spotlight.open()
    })
    const input = await screen.findByRole("textbox", { name: "Globální vyhledávání" })
    fireEvent.change(input, { target: { value: "" } })
    act(() => {
        spotlight.close()
    })
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
})

test("offers recently opened records when query is empty", async () => {
    rememberRecentRecord({ kind: "client", id: 2 })
    rememberRecentRecord({ kind: "group", id: 21 })
    await renderAppSpotlight()
    await openSpotlight()

    // uvozovky: čte se interní Mantine CSS proměnná --spotlight-label (jsdom neumí přečíst
    // ::before content) — při upgradu Mantine může assert vyžadovat úpravu
    await waitFor(() => expect(getGroupLabels()).toEqual(["'Naposledy otevřené'"]))
    // nejnovější první
    expect(getActionLabels()).toEqual(["Žabky", "Rod Pavels"])
})

test("skips a remembered record that is no longer among active records", async () => {
    rememberRecentRecord({ kind: "client", id: 999 })
    rememberRecentRecord({ kind: "client", id: 2 })
    await renderAppSpotlight()
    await openSpotlight()

    await waitFor(() => expect(getActionLabels()).toEqual(["Rod Pavels"]))
})

test("invites typing when nothing has been opened yet", async () => {
    await renderAppSpotlight()
    await openSpotlight()

    expect(await screen.findByText("Začněte psát jméno klienta nebo skupiny.")).toBeInTheDocument()
})

test("orders search results by relevance, not by source array order", async () => {
    await renderAppSpotlight()
    const input = await openSpotlight()

    fireEvent.change(input, { target: { value: "rod" } })

    // presna shoda "Rod Pavels" musi predbehnout slabou fuzzy shodu "Robeš Radim",
    // ktera je ve zdrojovem poli prvni; "Žáková Eva" a skupina "Žabky" neodpovidaji vubec
    await waitFor(() => expect(getActionLabels()).toEqual(["Rod Pavels", "Robeš Radim"]))
})

test("shows filtered match counts in group labels when query is active", async () => {
    await renderAppSpotlight()
    const input = await openSpotlight()

    fireEvent.change(input, { target: { value: "rod" } })

    // 2 nalezeni klienti ze 3 celkem; skupina bez shody uplne zmizi
    await waitFor(() => expect(getGroupLabels()).toEqual(["'Klienti (2)'"]))
})

test("opens the card of the record whose action is triggered", async () => {
    rememberRecentRecord({ kind: "client", id: 2 })
    const { router } = await renderAppSpotlight()
    await openSpotlight()

    fireEvent.click(await screen.findByText("Rod Pavels"))

    await waitFor(() => expect(router.state.location.pathname).toBe("/klienti/2"))
})

test("marks a group result with the color of its course", async () => {
    await renderAppSpotlight()
    const input = await openSpotlight()

    fireEvent.change(input, { target: { value: "zab" } })

    // stejný chip jako v seznamu skupin (`<CourseName band />`) — barva kurzu do něj jde
    // inline CSS proměnnou, takže se čte z ní; `getComputedStyle` v jsdom `var()` nerozbalí
    const courseName = await screen.findByText("Plavání")
    expect(courseName).toHaveAttribute("data-qa", "course_name")
    expect(courseName.style.getPropertyValue(cssVarName(courseBandVars.color))).toBe("#f39c12")
})

test("shows keyboard hints for moving, opening and closing", async () => {
    await renderAppSpotlight()
    await openSpotlight()

    expect(screen.getByText("pohyb")).toBeInTheDocument()
    expect(screen.getByText("otevřít")).toBeInTheDocument()
    expect(screen.getByText("zavřít")).toBeInTheDocument()
})

test("shows nothing found message for query without matches", async () => {
    await renderAppSpotlight()
    const input = await openSpotlight()

    fireEvent.change(input, { target: { value: "qqq" } })

    expect(await screen.findByText("Žádné výsledky odpovídající dotazu.")).toBeInTheDocument()
})

test("tracks search_used once with has_results=true after closing", async () => {
    await renderAppSpotlight()
    const input = await openSpotlight()

    // vice zmen dotazu v jedne session => stale jen jeden event (az pri zavreni)
    fireEvent.change(input, { target: { value: "ro" } })
    fireEvent.change(input, { target: { value: "rod" } })
    expect(trackEvent).not.toHaveBeenCalled()

    act(() => {
        spotlight.close()
    })

    expect(trackEvent).toHaveBeenCalledTimes(1)
    expect(trackEvent).toHaveBeenCalledWith("search_used", { has_results: true })
})

test("tracks search_used with has_results=false for query without matches", async () => {
    await renderAppSpotlight()
    const input = await openSpotlight()

    fireEvent.change(input, { target: { value: "qqq" } })
    act(() => {
        spotlight.close()
    })

    expect(trackEvent).toHaveBeenCalledTimes(1)
    expect(trackEvent).toHaveBeenCalledWith("search_used", { has_results: false })
})

test("doesn't track search_used without a query of at least 2 characters", async () => {
    await renderAppSpotlight()
    const input = await openSpotlight()

    fireEvent.change(input, { target: { value: "r" } })
    act(() => {
        spotlight.close()
    })

    expect(trackEvent).not.toHaveBeenCalled()
})
