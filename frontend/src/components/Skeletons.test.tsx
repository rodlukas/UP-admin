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

test("only the primary shell schedules an overlong-loading timer, not every shell", () => {
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout")

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

    // ne N nezavislych casovacu pro N soucasne pripojenych obalu — hlaseni jde beztak
    // zobrazit jen tomu primarnimu
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1)
    setTimeoutSpy.mockRestore()
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

test("a shell that inherits primary status keeps its own elapsed loading time, not a fresh countdown", async () => {
    const ELAPSED_BEFORE_HANDOFF_MS = 20 * 1000

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

    // oba obaly se nacitaji stejne dlouho od stejne chvile — prvnich 20 s vlastnik hlaseni drzi
    await act(async () => {
        await vi.advanceTimersByTimeAsync(ELAPSED_BEFORE_HANDOFF_MS)
    })
    view.unmount()

    // zbyvajicich ~5 s do puvodniho prahu (25 s celkem) nesmi hlaseni jeste ukazat, protoze
    // by to znamenalo, ze si prevzaty obal odpocet spustil od nuly znovu
    await act(async () => {
        await vi.advanceTimersByTimeAsync(OVERLONG_MS - ELAPSED_BEFORE_HANDOFF_MS - 100)
    })
    expect(screen.queryByText(/Načítání trvá příliš dlouho/)).not.toBeInTheDocument()

    // po dojetí PŮVODNÍHO prahu (od prvotního mountu, ne od převzetí) uz hlaseni prijde
    await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
    })
    expect(screen.getByText(/Načítání trvá příliš dlouho/)).toBeInTheDocument()
})
