import { MantineProvider } from "@mantine/core"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import * as React from "react"

import { createQueryClient } from "../api/queryClient"
import MembershipService from "../api/services/MembershipService"
import { createTestRouter } from "../testUtils/createTestRouter"
import { MembershipType } from "../types/models"

import PrepaidCounters from "./PrepaidCounters"

// mock service vrstvy - testy tak ridi okamzik a poradi resolvnuti PATCH requestu
// (useMutation z TanStack Query vcetne onSuccess/onError callbacku zustava realny)
vi.mock("../api/services/MembershipService", () => ({
    default: {
        patch: vi.fn(),
    },
}))

const patchMock = vi.mocked(MembershipService).patch

/** Promise s rucne ovladatelnym resolvnutim - simulace PATCH requestu "v letu". */
function createDeferred(): {
    promise: Promise<MembershipType>
    resolve: (value: MembershipType) => void
} {
    let resolve!: (value: MembershipType) => void
    const promise = new Promise<MembershipType>((res) => {
        resolve = res
    })
    return { promise, resolve }
}

function createMembership(id: number, prepaidCnt: number): MembershipType {
    return {
        id,
        prepaid_cnt: prepaidCnt,
        client: {
            id: id + 100,
            active: true,
            email: "",
            note: "",
            phone: "",
            firstname: `Jmeno${id}`,
            surname: `Prijmeni${id}`,
            last_lecture_date: null,
        },
    }
}

/**
 * Vyrenderuje PrepaidCounters a vrati setter membershipu - ten simuluje refetch,
 * ktery komponente zvenku doruci novou (treba i zastaralou) verzi dat.
 */
async function renderPrepaidCounters(memberships: MembershipType[]): Promise<{
    queryClient: QueryClient
    refetchMemberships: (next: MembershipType[]) => void
    unmount: () => void
}> {
    const queryClient = createQueryClient()
    let setMemberships: (next: MembershipType[]) => void = () => undefined
    const Wrapper: React.FC = () => {
        const [current, setCurrent] = React.useState(memberships)
        setMemberships = setCurrent
        return <PrepaidCounters memberships={current} isGroupActive />
    }
    const router = await createTestRouter(
        <MantineProvider env="test">
            <Wrapper />
        </MantineProvider>,
    )
    const { unmount } = render(
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>,
    )
    return {
        queryClient,
        refetchMemberships: (next): void => {
            act(() => {
                setMemberships(next)
            })
        },
        unmount,
    }
}

/** Počká, až se všechny mutace usadí (PATCH doběhl včetně onSuccess/onError). */
async function waitForMutationsSettled(queryClient: QueryClient): Promise<void> {
    await waitFor(() => expect(queryClient.isMutating()).toBe(0))
}

/**
 * Propustí frontu (micro)tasků - TanStack Query volá mutationFn asynchronně, takže assert
 * "PATCH se NEodeslal" by bez toho prošel falešně pozitivně.
 */
async function flushAsync(): Promise<void> {
    await act(async () => {
        await new Promise((resolve) => {
            globalThis.setTimeout(resolve, 0)
        })
    })
}

beforeEach(() => {
    patchMock.mockReset()
})

test("renders a counter input with the initial value for each membership", async () => {
    await renderPrepaidCounters([createMembership(1, 3), createMembership(2, 0)])

    const inputs = screen.getAllByRole("spinbutton")
    expect(inputs).toHaveLength(2)
    expect(inputs[0]).toHaveValue(3)
    expect(inputs[1]).toHaveValue(0)
    expect(screen.getByText("Prijmeni1")).toBeInTheDocument()
    expect(screen.getByText("Prijmeni2")).toBeInTheDocument()
})

test("shows a message when there are no memberships", async () => {
    await renderPrepaidCounters([])

    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument()
    expect(screen.getByText("Žádní účastníci")).toBeInTheDocument()
})

test("sends PATCH on blur and doesn't repeat it for an unchanged value", async () => {
    patchMock.mockResolvedValue(createMembership(1, 7))
    const { queryClient } = await renderPrepaidCounters([createMembership(1, 3)])
    const input = screen.getByRole("spinbutton")

    // blur bez zmeny hodnoty -> zadny PATCH
    fireEvent.blur(input)
    await flushAsync()
    expect(patchMock).not.toHaveBeenCalled()

    fireEvent.change(input, { target: { value: "7" } })
    fireEvent.blur(input)

    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1))
    expect(patchMock).toHaveBeenCalledWith({ id: 1, prepaid_cnt: 7 })
    await waitForMutationsSettled(queryClient)
    expect(input).toHaveValue(7)

    // server hodnotu potvrdil -> dalsi blur se stejnou hodnotou neposila duplicitni PATCH
    fireEvent.blur(input)
    await flushAsync()
    expect(patchMock).toHaveBeenCalledTimes(1)
})

test("refetch with stale data doesn't clobber a newer local edit", async () => {
    const deferred = createDeferred()
    patchMock.mockReturnValueOnce(deferred.promise)
    const { queryClient, refetchMemberships } = await renderPrepaidCounters([
        createMembership(1, 3),
    ])
    const input = screen.getByRole("spinbutton")

    // uzivatel ulozi 7 (PATCH zustava v letu) a hned rozepise novou hodnotu 9
    fireEvent.change(input, { target: { value: "7" } })
    fireEvent.blur(input)
    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1))
    fireEvent.change(input, { target: { value: "9" } })

    // mezitim dorazi refetch se zastaralym server stavem (3) -> nesmi prepsat rozepsanou 9
    refetchMemberships([createMembership(1, 3)])
    expect(input).toHaveValue(9)

    // doraz odpovedi na PATCH (7) take nesmi prepsat novejsi lokalni hodnotu
    deferred.resolve(createMembership(1, 7))
    await waitForMutationsSettled(queryClient)
    expect(input).toHaveValue(9)
})

// Pozn.: cast ochrany proti out-of-order odpovedim zajistuje uz TanStack Query v5 -
// per-mutate onSuccess/onError callbacky vystreli jen pro POSLEDNI mutate() na dane
// useMutation instanci, starsi (prekonana) mutace zadny callback nedostane. Test pres
// realny useMutation proto overuje vysledny pozorovatelny kontrakt komponenty, nikoli
// jen jeji vnitrni guard v onSuccess (ten je timto seamem nedosazitelny).
test("out-of-order PATCH responses don't overwrite the newer confirmed value", async () => {
    const firstPatch = createDeferred()
    const secondPatch = createDeferred()
    patchMock.mockReturnValueOnce(firstPatch.promise).mockReturnValueOnce(secondPatch.promise)
    const { queryClient } = await renderPrepaidCounters([createMembership(1, 3)])
    const input = screen.getByRole("spinbutton")

    // uzivatel ulozi 7 a jeste pred dobehnutim PATCHe ulozi 9 (dva PATCHe v letu)
    fireEvent.change(input, { target: { value: "7" } })
    fireEvent.blur(input)
    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1))
    fireEvent.change(input, { target: { value: "9" } })
    fireEvent.blur(input)
    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(2))
    expect(patchMock).toHaveBeenNthCalledWith(1, { id: 1, prepaid_cnt: 7 })
    expect(patchMock).toHaveBeenNthCalledWith(2, { id: 1, prepaid_cnt: 9 })

    // odpovedi dorazi v opacnem poradi: nejdriv novejsi (9), pak starsi (7)
    secondPatch.resolve(createMembership(1, 9))
    await waitFor(() => expect(queryClient.isMutating()).toBe(1))
    firstPatch.resolve(createMembership(1, 7))
    await waitForMutationsSettled(queryClient)
    expect(input).toHaveValue(9)

    // server-potvrzena hodnota je 9 (ne 7 ze starsi odpovedi)
    // -> blur se stejnou hodnotou nesmi vyvolat treti PATCH
    fireEvent.blur(input)
    await flushAsync()
    expect(patchMock).toHaveBeenCalledTimes(2)
})

// TanStack Query v5 dorucuje per-mutate callbacky jen POSLEDNIMU mutate() na instanci -
// pri soubehu PATCHu dvou ruznych clenu se cleanup prvniho nesmi ztratit (jinak zustane
// prvni clen navzdy "dirty" a ignoruje vsechny dalsi refetche).
test("concurrent saves of two different members both complete their cleanup", async () => {
    const firstPatch = createDeferred()
    const secondPatch = createDeferred()
    patchMock.mockReturnValueOnce(firstPatch.promise).mockReturnValueOnce(secondPatch.promise)
    const { queryClient, refetchMemberships } = await renderPrepaidCounters([
        createMembership(1, 3),
        createMembership(2, 5),
    ])
    const [input1, input2] = screen.getAllByRole("spinbutton")

    // uzivatel ulozi clena 1 (PATCH v letu) a hned nato ulozi clena 2
    fireEvent.change(input1, { target: { value: "7" } })
    fireEvent.blur(input1)
    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1))
    fireEvent.change(input2, { target: { value: "8" } })
    fireEvent.blur(input2)
    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(2))

    firstPatch.resolve(createMembership(1, 7))
    secondPatch.resolve(createMembership(2, 8))
    await waitForMutationsSettled(queryClient)

    // oba PATCHe dobehly -> zadny clen neni dirty a pozdejsi serverova zmena
    // (napr. dekrement po predplacene lekci) se musi propsat do UI
    refetchMemberships([createMembership(1, 4), createMembership(2, 8)])
    expect(input1).toHaveValue(4)
    expect(input2).toHaveValue(8)
})

// React unmount nevyvola blur - rozepsana hodnota by se pri SPA navigaci tise ztratila
test("unmount flushes an edited value that never received blur", async () => {
    patchMock.mockResolvedValue(createMembership(1, 7))
    const { unmount } = await renderPrepaidCounters([createMembership(1, 3)])
    const input = screen.getByRole("spinbutton")

    fireEvent.change(input, { target: { value: "7" } })
    unmount()

    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1))
    expect(patchMock).toHaveBeenCalledWith({ id: 1, prepaid_cnt: 7 })
})

// Zavreni tabu blur ani unmount nezaruci - prohlizec musi varovat pres beforeunload
test("beforeunload is prevented only while an edit is unsaved", async () => {
    patchMock.mockResolvedValue(createMembership(1, 7))
    const { queryClient } = await renderPrepaidCounters([createMembership(1, 3)])
    const input = screen.getByRole("spinbutton")

    // bez rozepsane zmeny se zavreni tabu nesmi blokovat
    const eventBefore = new Event("beforeunload", { cancelable: true })
    window.dispatchEvent(eventBefore)
    expect(eventBefore.defaultPrevented).toBe(false)

    fireEvent.change(input, { target: { value: "7" } })
    const eventDirty = new Event("beforeunload", { cancelable: true })
    window.dispatchEvent(eventDirty)
    expect(eventDirty.defaultPrevented).toBe(true)

    // po ulozeni (blur + dobehnuti PATCHe) uz zadna neulozena zmena neni
    fireEvent.blur(input)
    await waitForMutationsSettled(queryClient)
    const eventSaved = new Event("beforeunload", { cancelable: true })
    window.dispatchEvent(eventSaved)
    expect(eventSaved.defaultPrevented).toBe(false)
})
