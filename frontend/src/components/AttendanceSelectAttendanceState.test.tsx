import { MantineProvider } from "@mantine/core"
import { QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"

import { createQueryClient } from "../api/queryClient"
import { AttendanceStatesContext } from "../contexts/AttendanceStatesContext"
import { AttendanceStateType } from "../types/models"

import AttendanceSelectAttendanceState from "./AttendanceSelectAttendanceState"

const STATES: AttendanceStateType[] = [
    { id: 1, name: "OK", default: true, excused: false, visible: true },
    { id: 2, name: "Omluven", default: false, excused: true, visible: true },
]

const renderWithContext = (context: {
    attendancestates: AttendanceStateType[]
    isLoading: boolean
    hasData: boolean
}) =>
    render(
        <MantineProvider>
            <QueryClientProvider client={createQueryClient()}>
                <AttendanceStatesContext.Provider value={context}>
                    <AttendanceSelectAttendanceState attendanceId={1} value={1} source="diary" />
                </AttendanceStatesContext.Provider>
            </QueryClientProvider>
        </MantineProvider>,
    )

test("shows the current state's name once attendance states are loaded", () => {
    renderWithContext({ attendancestates: STATES, isLoading: false, hasData: true })

    expect(screen.getByRole("combobox")).toHaveValue("OK")
    expect(screen.getByRole("combobox")).toBeEnabled()
})

// `hasData` je `false` i BĚHEM běžného načítání (ne jen po chybě) — bez `!isLoading`
// by tenhle běžný stav vypadal jako chyba na každém studeném načtení Diáře/Přehledu
test("does not show a load-error state while attendance states are still loading", () => {
    renderWithContext({ attendancestates: [], isLoading: true, hasData: false })

    const select = screen.getByRole("combobox")
    expect(select).toBeEnabled()
    expect(select).not.toHaveAttribute("placeholder", "Nepodařilo se načíst")
})

test("shows a disabled load-error state once loading has genuinely failed", () => {
    renderWithContext({ attendancestates: [], isLoading: false, hasData: false })

    const select = screen.getByRole("combobox", { name: "Stav účasti se nepodařilo načíst" })
    expect(select).toBeDisabled()
    expect(select).toHaveAttribute("placeholder", "Nepodařilo se načíst")
})
