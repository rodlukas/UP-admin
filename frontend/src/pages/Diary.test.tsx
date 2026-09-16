import { onlineManager, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { act, render, screen, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import * as React from "react"

import * as data from "../../__mocks__/data.json"
import MockContexts from "../../__mocks__/MockContexts"
import { server } from "../../vitest.setup"
import { createQueryClient } from "../api/queryClient"
import * as dayStyles from "../components/DashboardDay.css"
import { AttendanceStatesContext } from "../contexts/AttendanceStatesContext"
import { addDays, getMonday, toISODate } from "../global/funcDateTime"
import { createTestRouter } from "../testUtils/createTestRouter"

import Diary from "./Diary"

/**
 * Handler, který odpovídá podle dne — sdílený ve `vitest.setup.ts` vrací tytéž lekce na
 * každý dotaz, takže by všech pět sloupců diáře dostalo identická data. V takovém DOMu
 * je `id="lecture-88"` pětkrát a hlavně v něm nejde sestavit situace „jeden sloupec lekci
 * má, ostatní ne" — tedy přesně to, co úklid search parametru musí rozlišit.
 *
 * Rozdělení: pondělí drží lekci 89, úterý lekci 88 (cílovou), zbytek týdne je volný.
 */
function useLecturesByDay(): void {
    const monday = getMonday(new Date())
    const byDate: Record<string, unknown[]> = {
        [toISODate(monday)]: [data.lectures[1]],
        [toISODate(addDays(monday, 1))]: [data.lectures[0]],
    }
    server.use(
        http.get("/api/v1/lectures/", ({ request }) => {
            const date = new URL(request.url).searchParams.get("date") ?? ""
            return HttpResponse.json(byDate[date] ?? [])
        }),
    )
}

/**
 * Stavy docházky, které dorazí až ve chvíli, kdy je test pustí — do té doby drží
 * `DashboardDay` v `showLoading`, i když má vlastní lekce dávno načtené. Přesně ten stav,
 * kvůli kterému `Diary` nesmí uklízet search parametr jen podle doběhnutí týdne.
 *
 * Řízené promisou, ne časovačem: s časovačem závisí na tom, jestli stihne dřív on, nebo
 * odpověď msw, takže na pomalém stroji ten stav vůbec nenastane a test projde, aniž by
 * cokoliv ověřil.
 */
const GatedAttendanceStates: React.FC<{
    /** Dokud nedoběhne, tváří se stavy docházky jako načítané. */
    ready: Promise<void>
    children: React.ReactNode
}> = ({ ready, children }) => {
    const [isLoading, setIsLoading] = React.useState(true)
    React.useEffect(() => {
        let isCurrent = true
        void ready.then(() => {
            if (isCurrent) {
                setIsLoading(false)
            }
        })
        return () => {
            isCurrent = false
        }
    }, [ready])
    const value = React.useMemo(
        () => ({ isLoading, hasData: !isLoading, attendancestates: data.attendancestates }),
        [isLoading],
    )
    return (
        <AttendanceStatesContext.Provider value={value}>
            {children}
        </AttendanceStatesContext.Provider>
    )
}

async function setupDiary(path: string, attendanceStatesReady?: Promise<void>) {
    const diary =
        attendanceStatesReady === undefined ? (
            <Diary />
        ) : (
            <GatedAttendanceStates ready={attendanceStatesReady}>
                <Diary />
            </GatedAttendanceStates>
        )
    const router = await createTestRouter(<MockContexts>{diary}</MockContexts>, { path })
    render(
        <QueryClientProvider client={createQueryClient()}>
            <RouterProvider router={router} />
        </QueryClientProvider>,
    )
    return router
}

test("the ?lecture= param is cleared when no day in the week holds that lecture", async () => {
    // Mřížka kreslí jen pondělí až pátek, ale "Nejbližší lekce" nabízejí i lekci o víkendu —
    // tam by parametr neuklidil žádný sloupec a visel by v URL dál (viz Diary.tsx).
    useLecturesByDay()
    const router = await setupDiary("/?lecture=999")
    await screen.findAllByTestId("lecture")

    await waitFor(() => {
        expect(router.state.location.search).toEqual({})
    })
})

test("a lecture that is in the week still gets highlighted before the param is cleared", async () => {
    // Pojistka proti tomu, aby úklid v `Diary` nesebral parametr sloupci, který lekci má, ale
    // čeká ještě na stavy docházky — proto se maže podle „lekce v týdnu není", ne podle
    // samotného doběhnutí týdne.
    useLecturesByDay()
    let releaseAttendanceStates!: () => void
    const attendanceStatesReady = new Promise<void>((resolve) => {
        releaseAttendanceStates = resolve
    })
    const router = await setupDiary("/?lecture=88", attendanceStatesReady)

    // Proužek volných dnů se vykreslí, až když doběhne CELÝ týden (`isWeekSettled`), a je
    // tedy signálem přesně toho okamžiku, ve kterém by úklid podle doběhnutí týdne udeřil —
    // sloupce zatím pořád čekají na stavy docházky.
    expect(await screen.findByText("Volno")).toBeInTheDocument()
    expect(router.state.location.search).toEqual({ lecture: 88 })

    await act(async () => {
        releaseAttendanceStates()
        // počkat na tutéž promisu: efekt v `GatedAttendanceStates` na ni visí taky, takže
        // se tím jeho `setIsLoading` stihne uvnitř `act`
        await attendanceStatesReady
    })

    const items = await screen.findAllByTestId("lecture")
    // právě jedna lekce 88, právě jeden sloupec ji má — viz `useLecturesByDay`
    const withTargetId = items.filter((item) => item.id === "lecture-88")
    expect(withTargetId).toHaveLength(1)
    expect(withTargetId[0]).toHaveClass(dayStyles.lectureHighlighted)
    // a sloupec, který ji nemá, zvýraznění nedostane
    expect(items.filter((item) => item.id !== "lecture-88")).not.toHaveLength(0)
    for (const other of items.filter((item) => item.id !== "lecture-88")) {
        expect(other).not.toHaveClass(dayStyles.lectureHighlighted)
    }

    await waitFor(() => {
        expect(router.state.location.search).toEqual({})
    })
})

test("the ?lecture= param survives while the week is offline", async () => {
    // Offline je dotaz `pending`/`paused`, tedy ani `isLoading`, ani chyba — bez kontroly
    // na skutečně načtená data by úklid parametr smazal dřív, než data vůbec dorazí,
    // a po obnovení sítě by se lekce načetla, ale nikam nedorolovala a nezvýraznila.
    onlineManager.setOnline(false)
    try {
        const router = await setupDiary("/?lecture=88")
        // „Nepodařilo se načíst" vykreslí sloupec právě tehdy, když dotaz doběhl a data
        // nedorazila — tedy ve stavu, ve kterém by chybný úklid parametr sebral. Čekat na
        // něj je proto silnější než čekat na uplynulý čas, po kterém se nic tvrdit nedá.
        await screen.findAllByText("Nepodařilo se načíst")
        expect(router.state.location.search).toEqual({ lecture: 88 })
    } finally {
        onlineManager.setOnline(true)
    }
})
