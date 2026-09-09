import { MantineProvider } from "@mantine/core"
import { act, render, screen } from "@testing-library/react"

import { SkeletonShell } from "./Skeletons"

const renderWithMantine = (ui: React.ReactElement) =>
    render(<MantineProvider>{ui}</MantineProvider>)

/** Po jak dlouhé době kostra nabídne znovunačtení stránky (`OVERLONG_LOADING_THRESHOLD`). */
const OVERLONG_MS = 25 * 1000

beforeEach(() => {
    vi.useFakeTimers()
})

afterEach(() => {
    vi.useRealTimers()
})

test("marks every shell for the E2E steps, so none of them can be waited past", () => {
    renderWithMantine(
        <>
            <SkeletonShell>
                <div />
            </SkeletonShell>
            <SkeletonShell>
                <div />
            </SkeletonShell>
        </>,
    )

    // `wait_loading_ends` v tests/ui_steps/helpers.py ceka, dokud nezmizi VSECHNY vyskyty
    expect(screen.getAllByTestId("loading")).toHaveLength(2)
})

test("keeps a single live region even when the page renders several shells", () => {
    renderWithMantine(
        <>
            <SkeletonShell>
                <div />
            </SkeletonShell>
            <SkeletonShell>
                <div />
            </SkeletonShell>
            <SkeletonShell>
                <div />
            </SkeletonShell>
        </>,
    )

    // tri sloupce kostry nesmi ctecce obrazovky predcitat tri soubezne oblasti
    expect(screen.getAllByRole("status")).toHaveLength(1)
})

test("reports overlong loading once, not once per shell", async () => {
    renderWithMantine(
        <>
            <SkeletonShell>
                <div />
            </SkeletonShell>
            <SkeletonShell>
                <div />
            </SkeletonShell>
            <SkeletonShell>
                <div />
            </SkeletonShell>
        </>,
    )

    await act(async () => {
        await vi.advanceTimersByTimeAsync(OVERLONG_MS + 100)
    })

    // diar ma sloupec na kazdy den tydne — tri hlaseni se tremi tlacitky je sum, ne informace
    expect(screen.getAllByText(/Načítání trvá příliš dlouho/)).toHaveLength(1)
})

test("hands the report over when the shell that owned it unmounts", async () => {
    const view = render(
        <SkeletonShell>
            <div />
        </SkeletonShell>,
    )
    renderWithMantine(
        <SkeletonShell>
            <div />
        </SkeletonShell>,
    )

    // v dokumentu zustava jen druhy obal, `screen` uz tedy mluvi o nem
    view.unmount()
    // nejdriv nechej prebrat vlastnictvi (a tim nasadit pojistku), pak ji nechej dojet
    await act(async () => {
        await vi.advanceTimersByTimeAsync(0)
    })
    await act(async () => {
        await vi.advanceTimersByTimeAsync(OVERLONG_MS + 100)
    })

    // odmount vlastnika nesmi hlaseni ztratit — prebira ho zbyly obal
    expect(screen.getByRole("status")).toBeInTheDocument()
    expect(screen.getByText(/Načítání trvá příliš dlouho/)).toBeInTheDocument()
})
