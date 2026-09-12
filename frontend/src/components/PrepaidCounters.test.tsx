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

/** Promise s rucne ovladatelnym resolvnutim/zamitnutim - simulace PATCH requestu "v letu". */
function createDeferred(): {
    promise: Promise<MembershipType>
    resolve: (value: MembershipType) => void
    reject: (error: unknown) => void
} {
    let resolve!: (value: MembershipType) => void
    let reject!: (error: unknown) => void
    const promise = new Promise<MembershipType>((res, rej) => {
        resolve = res
        reject = rej
    })
    return { promise, resolve, reject }
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
    container: HTMLElement
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
    const { unmount, container } = render(
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
        container,
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

    const inputs = screen.getAllByRole("textbox")
    expect(inputs).toHaveLength(2)
    expect(inputs[0]).toHaveValue("3")
    expect(inputs[1]).toHaveValue("0")
    expect(screen.getByText("Prijmeni1")).toBeInTheDocument()
    expect(screen.getByText("Prijmeni2")).toBeInTheDocument()
})

test("shows a message when there are no memberships", async () => {
    await renderPrepaidCounters([])

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    expect(screen.getByText("Žádní účastníci")).toBeInTheDocument()
})

test("sends PATCH on blur and doesn't repeat it for an unchanged value", async () => {
    patchMock.mockResolvedValue(createMembership(1, 7))
    const { queryClient } = await renderPrepaidCounters([createMembership(1, 3)])
    const input = screen.getByRole("textbox")

    // blur bez zmeny hodnoty -> zadny PATCH
    fireEvent.blur(input)
    await flushAsync()
    expect(patchMock).not.toHaveBeenCalled()

    fireEvent.change(input, { target: { value: "7" } })
    fireEvent.blur(input)

    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1))
    expect(patchMock).toHaveBeenCalledWith({ id: 1, prepaid_cnt: 7 })
    await waitForMutationsSettled(queryClient)
    expect(input).toHaveValue("7")

    // server hodnotu potvrdil -> dalsi blur se stejnou hodnotou neposila duplicitni PATCH
    fireEvent.blur(input)
    await flushAsync()
    expect(patchMock).toHaveBeenCalledTimes(1)
})

// bez obalujiciho <form> by Enter jinak neudelal nic a uzivatel by nemel zpusob,
// jak zmenu ulozit bez kliknuti/tabu mimo pole
test("pressing Enter commits the value the same way blur does", async () => {
    patchMock.mockResolvedValue(createMembership(1, 7))
    const { queryClient } = await renderPrepaidCounters([createMembership(1, 3)])
    const input = screen.getByRole("textbox")

    input.focus()
    fireEvent.change(input, { target: { value: "7" } })
    fireEvent.keyDown(input, { key: "Enter" })

    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1))
    expect(patchMock).toHaveBeenCalledWith({ id: 1, prepaid_cnt: 7 })
    await waitForMutationsSettled(queryClient)
    expect(input).not.toHaveFocus()
})

// `NumberInput` drzi focus v poli i po kliknuti na +/- (viz PrepaidCounters.tsx), takze
// blur po nich nikdy neprijde - bez explicitniho onValueChange handleru by krok tlacitkem
// zmenil zobrazenou hodnotu, ale needal se ulozit, dokud uzivatel pole neopusti
test("clicking the increment control commits the value without waiting for blur", async () => {
    patchMock.mockResolvedValue(createMembership(1, 4))
    const { queryClient, container } = await renderPrepaidCounters([createMembership(1, 3)])
    const input = screen.getByRole("textbox")
    const incrementButton = container.querySelector('button[data-direction="up"]')
    expect(incrementButton).not.toBeNull()

    fireEvent.pointerDown(incrementButton!)

    expect(input).toHaveValue("4")
    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1))
    expect(patchMock).toHaveBeenCalledWith({ id: 1, prepaid_cnt: 4 })
    await waitForMutationsSettled(queryClient)
})

test("refetch with stale data doesn't clobber a newer local edit", async () => {
    const deferred = createDeferred()
    patchMock.mockReturnValueOnce(deferred.promise)
    const { queryClient, refetchMemberships } = await renderPrepaidCounters([
        createMembership(1, 3),
    ])
    const input = screen.getByRole("textbox")

    // uzivatel ulozi 7 (PATCH zustava v letu) a hned rozepise novou hodnotu 9
    fireEvent.change(input, { target: { value: "7" } })
    fireEvent.blur(input)
    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1))
    fireEvent.change(input, { target: { value: "9" } })

    // mezitim dorazi refetch se zastaralym server stavem (3) -> nesmi prepsat rozepsanou 9
    refetchMemberships([createMembership(1, 3)])
    expect(input).toHaveValue("9")

    // doraz odpovedi na PATCH (7) take nesmi prepsat novejsi lokalni hodnotu
    deferred.resolve(createMembership(1, 7))
    await waitForMutationsSettled(queryClient)
    expect(input).toHaveValue("9")
})

// `scope` v usePatchMembership radi PATCHe jednoho clenstvi za sebe, takze odpovedi nemuzou
// dorazit v jinem poradi, nez v jakem requesty odesly - a server nemuze skoncit na starsi
// hodnote. Drive to resila rucni evidence poradi v komponente.
test("PATCHes for one member are serialized, so they can't overtake each other", async () => {
    const firstPatch = createDeferred()
    const secondPatch = createDeferred()
    patchMock.mockReturnValueOnce(firstPatch.promise).mockReturnValueOnce(secondPatch.promise)
    const { queryClient } = await renderPrepaidCounters([createMembership(1, 3)])
    const input = screen.getByRole("textbox")

    // uzivatel ulozi 7 a jeste pred dobehnutim ulozi 9
    fireEvent.change(input, { target: { value: "7" } })
    fireEvent.blur(input)
    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1))
    fireEvent.change(input, { target: { value: "9" } })
    fireEvent.blur(input)

    // druhy PATCH ceka ve fronte - na server zatim neodesel
    await flushAsync()
    expect(patchMock).toHaveBeenCalledTimes(1)
    expect(patchMock).toHaveBeenNthCalledWith(1, { id: 1, prepaid_cnt: 7 })

    // teprve dobehnuti prvniho pusti druhy
    firstPatch.resolve(createMembership(1, 7))
    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(2))
    expect(patchMock).toHaveBeenNthCalledWith(2, { id: 1, prepaid_cnt: 9 })

    secondPatch.resolve(createMembership(1, 9))
    await waitForMutationsSettled(queryClient)
    expect(input).toHaveValue("9")

    // server-potvrzena hodnota je 9 -> blur se stejnou hodnotou neposila treti PATCH
    fireEvent.blur(input)
    await flushAsync()
    expect(patchMock).toHaveBeenCalledTimes(2)
})

// serializace nesmi znamenat, ze selhani jednoho PATCHe spolkne ten zarazeny za nim -
// to by byla tichá ztráta zápisu vymenena za jinou
test("a queued PATCH still runs after the preceding one fails", async () => {
    const firstPatch = createDeferred()
    patchMock.mockReturnValueOnce(firstPatch.promise).mockResolvedValueOnce(createMembership(1, 9))
    const { queryClient } = await renderPrepaidCounters([createMembership(1, 3)])
    const input = screen.getByRole("textbox")

    fireEvent.change(input, { target: { value: "7" } })
    fireEvent.blur(input)
    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1))
    fireEvent.change(input, { target: { value: "9" } })
    fireEvent.blur(input)

    // druhy PATCH musi skutecne CEKAT ve fronte - bez tohohle assertu by test prosel
    // i bez `scope` (druhy PATCH by odesel rovnou) a netvrdil by nic o zarazovani
    await flushAsync()
    expect(patchMock).toHaveBeenCalledTimes(1)

    firstPatch.reject(new Error("network error"))
    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(2))
    expect(patchMock).toHaveBeenNthCalledWith(2, { id: 1, prepaid_cnt: 9 })
    await waitForMutationsSettled(queryClient)
    expect(input).toHaveValue("9")
})

// po selhani neni jiste, jestli se ztratil pozadavek nebo az odpoved - hodnota tedy plati
// za neulozenou a dalsi blur ji musi poslat znovu, ne ji povazovat za ne-op
test("a retry after a failed PATCH is sent again", async () => {
    patchMock
        .mockRejectedValueOnce(new Error("network error"))
        .mockResolvedValueOnce(createMembership(1, 9))
    const { queryClient } = await renderPrepaidCounters([createMembership(1, 5)])
    const input = screen.getByRole("textbox")

    fireEvent.change(input, { target: { value: "9" } })
    fireEvent.blur(input)
    await waitForMutationsSettled(queryClient)
    expect(patchMock).toHaveBeenCalledTimes(1)

    // neulozena hodnota -> zavreni tabu musi varovat
    const eventDirty = new Event("beforeunload", { cancelable: true })
    window.dispatchEvent(eventDirty)
    expect(eventDirty.defaultPrevented).toBe(true)

    fireEvent.blur(input)
    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(2))
    expect(patchMock).toHaveBeenNthCalledWith(2, { id: 1, prepaid_cnt: 9 })
})

// stejny TanStack Query v5 seam jako u predchoziho testu (viz PrepaidCounters.tsx) - tady
// overuje, ze soubeh PATCHu DVOU ruznych clenu dokonci cleanup obou.
test("concurrent saves of two different members both complete their cleanup", async () => {
    const firstPatch = createDeferred()
    const secondPatch = createDeferred()
    patchMock.mockReturnValueOnce(firstPatch.promise).mockReturnValueOnce(secondPatch.promise)
    const { queryClient, refetchMemberships } = await renderPrepaidCounters([
        createMembership(1, 3),
        createMembership(2, 5),
    ])
    const [input1, input2] = screen.getAllByRole("textbox")

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
    expect(input1).toHaveValue("4")
    expect(input2).toHaveValue("8")
})

// unmount blur nevyvola, takze clamp z onBlur se na teto ceste neuplatni sam od sebe -
// bez nej by neplatna rozepsana hodnota sla na server a skoncila 400
test("unmount flush clamps an invalid in-progress value before sending it", async () => {
    patchMock.mockResolvedValue(createMembership(1, 0))
    const { unmount } = await renderPrepaidCounters([createMembership(1, 3)])
    const input = screen.getByRole("textbox")

    // zaporne cislo by server (PositiveIntegerField) odmitl 400
    fireEvent.change(input, { target: { value: "-3" } })
    unmount()

    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1))
    expect(patchMock).toHaveBeenCalledWith({ id: 1, prepaid_cnt: 0 })
})

// `allowDecimal={false}` je prvni obrana proti desetinnym hodnotam (server ma
// PositiveIntegerField) - bez nej by je krok +/- posunul na x.5 a odeslal rovnou, protoze
// tahle cesta na blur necheka
test("a decimal value can't be typed at all, so the stepper can't send one", async () => {
    patchMock.mockResolvedValue(createMembership(1, 8))
    const { container } = await renderPrepaidCounters([createMembership(1, 3)])
    const input = screen.getByRole("textbox")

    fireEvent.change(input, { target: { value: "7.6" } })
    expect(input).toHaveValue("7")

    const incrementButton = container.querySelector('button[data-direction="up"]')
    fireEvent.pointerDown(incrementButton!)

    expect(input).toHaveValue("8")
    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1))
    expect(patchMock).toHaveBeenCalledWith({ id: 1, prepaid_cnt: 8 })
})

// React unmount nevyvola blur - rozepsana hodnota by se pri SPA navigaci tise ztratila
test("unmount flushes an edited value that never received blur", async () => {
    patchMock.mockResolvedValue(createMembership(1, 7))
    const { unmount } = await renderPrepaidCounters([createMembership(1, 3)])
    const input = screen.getByRole("textbox")

    fireEvent.change(input, { target: { value: "7" } })
    unmount()

    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1))
    expect(patchMock).toHaveBeenCalledWith({ id: 1, prepaid_cnt: 7 })
})

// `min={0}` na inputu je jen napoveda pro spinner sipky - bez obalujiciho <form>
// (commit je na blur, ne na submit) nativni HTML constraint validace nikdy neprobehne,
// takze zaporna/neplatna hodnota by jinak dosla az na server jako PATCH
test("a negative value is clamped to 0 before the PATCH", async () => {
    patchMock.mockResolvedValue(createMembership(1, 0))
    await renderPrepaidCounters([createMembership(1, 3)])
    const input = screen.getByRole("textbox")

    fireEvent.change(input, { target: { value: "-3" } })
    fireEvent.blur(input)

    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1))
    expect(patchMock).toHaveBeenCalledWith({ id: 1, prepaid_cnt: 0 })
    expect(input).toHaveValue("0")
})

// `NumberInput` filtruje znaky za psani, takze napr. "1e999" uz se do pole vubec
// nedostane - jedina zbyvajici nevalidni-ale-pisatelna hodnota je osamoceny minus
// (rozepsany zaporny zapis), Number("-") je NaN
test("a non-finite value (lone minus sign) is clamped to 0 before the PATCH", async () => {
    patchMock.mockResolvedValue(createMembership(1, 0))
    await renderPrepaidCounters([createMembership(1, 3)])
    const input = screen.getByRole("textbox")

    fireEvent.change(input, { target: { value: "-" } })
    fireEvent.blur(input)

    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1))
    expect(patchMock).toHaveBeenCalledWith({ id: 1, prepaid_cnt: 0 })
    expect(input).toHaveValue("0")
})

// commit() drive kontrolovalo jen "neprisel novejsi COMMIT" (inFlightRef), ne "nezmenila
// se mezitim hodnota v poli" (onChange bez dalsiho bluru) - uspesny PATCH tak smazal
// dirtyRef i pod rozepsanou novejsi hodnotou a nasledujici refetch ji tise prepsal
test("a successful PATCH doesn't clear dirty when a newer unblurred edit is pending", async () => {
    const deferred = createDeferred()
    patchMock.mockReturnValueOnce(deferred.promise)
    const { queryClient, refetchMemberships } = await renderPrepaidCounters([
        createMembership(1, 3),
    ])
    const input = screen.getByRole("textbox")

    // ulozi 7 (PATCH zustava v letu), pak beze bluru rozepise 9 - jen onChange,
    // zadny dalsi commit/PATCH
    fireEvent.change(input, { target: { value: "7" } })
    fireEvent.blur(input)
    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1))
    fireEvent.change(input, { target: { value: "9" } })

    // PATCH(7) dorazi uspesne - nesmi smazat dirty pod rozepsanou 9
    deferred.resolve(createMembership(1, 7))
    await waitForMutationsSettled(queryClient)
    expect(input).toHaveValue("9")

    // refetch s prave potvrzenou hodnotou (7) nesmi prepsat rozepsanou 9
    refetchMemberships([createMembership(1, 7)])
    expect(input).toHaveValue("9")
})

// navrat na PUVODNI serverovou hodnotu, zatimco je odeslany PATCH s jinou hodnotou, neni
// ne-op: server uz smeruje na tu jinou hodnotu, takze bez vlastniho PATCHe by ji nechal
test("reverting to the server value while a PATCH is in flight still sends a PATCH", async () => {
    const deferred = createDeferred()
    patchMock.mockReturnValueOnce(deferred.promise).mockResolvedValueOnce(createMembership(1, 5))
    const { queryClient, refetchMemberships } = await renderPrepaidCounters([
        createMembership(1, 5),
    ])
    const input = screen.getByRole("textbox")

    // ulozi 9 (PATCH v letu), pak se vrati na puvodni 5 a znovu blurne
    fireEvent.change(input, { target: { value: "9" } })
    fireEvent.blur(input)
    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1))
    fireEvent.change(input, { target: { value: "5" } })
    fireEvent.blur(input)

    // navrat na 5 se MUSI odeslat (ve fronte za PATCHem 9), jinak by ho PATCH(9) prebil
    deferred.resolve(createMembership(1, 9))
    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(2))
    expect(patchMock).toHaveBeenNthCalledWith(2, { id: 1, prepaid_cnt: 5 })

    await waitForMutationsSettled(queryClient)
    refetchMemberships([createMembership(1, 5)])
    expect(input).toHaveValue("5")
})

// commit() drive u "stejna hodnota jako uz v letu" no-op vetve smazalo dirty rovnou,
// aniz vedelo, jestli ten bezici PATCH uspeje - kdyz pak selhal, dirty uz nemel kdo
// vratit zpet a neulozena hodnota vypadala jako cista
test("a duplicate commit for a value already in flight doesn't mark it clean if that PATCH later fails", async () => {
    const deferred = createDeferred()
    patchMock.mockReturnValueOnce(deferred.promise)
    const { queryClient, refetchMemberships } = await renderPrepaidCounters([
        createMembership(1, 5),
    ])
    const input = screen.getByRole("textbox")

    // ulozi 9 (PATCH zustava v letu), pak znovu blurne se stejnou hodnotou (zadna zmena) -
    // druhy commit(9) narazi na "uz v letu" vetev
    fireEvent.change(input, { target: { value: "9" } })
    fireEvent.blur(input)
    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1))
    fireEvent.blur(input)
    await flushAsync()
    expect(patchMock).toHaveBeenCalledTimes(1) // druhy blur neposlal duplicitni PATCH

    // puvodni (jediny) PATCH(9) selze - dirty nesmi zustat tise smazane
    deferred.reject(new Error("network error"))
    await waitForMutationsSettled(queryClient)

    // duplicitni commit se nesmel ani zaradit do fronty za ten prvni: `scope` zarazenou
    // mutaci spousti az po dobehnuti predchozi, takze pouhy assert hned po bluru vyse
    // by duplikat cekajici ve fronte vubec neuvidel
    expect(patchMock).toHaveBeenCalledTimes(1)

    // refetch se starou serverovou hodnotou (5) nesmi prepsat neulozenou 9
    refetchMemberships([createMembership(1, 5)])
    expect(input).toHaveValue("9")

    const eventDirty = new Event("beforeunload", { cancelable: true })
    window.dispatchEvent(eventDirty)
    expect(eventDirty.defaultPrevented).toBe(true)
})

// commit() drive kontrolovalo "probehl nejaky onChange od odeslani" (editGenRef), ne
// "odpovida aktualni hodnota te potvrzene" - navrat na stejnou hodnotu bez bluru tak
// zbytecne nechal dirty nastavene, i kdyz uz nic neulozeneho nebylo
test("returning to the just-confirmed value without a blur in between clears dirty", async () => {
    const deferred = createDeferred()
    patchMock.mockReturnValueOnce(deferred.promise)
    const { queryClient } = await renderPrepaidCounters([createMembership(1, 3)])
    const input = screen.getByRole("textbox")

    // ulozi 5 (PATCH zustava v letu), pak beze bluru rozepise 9 a vrati se zpet na 5
    fireEvent.change(input, { target: { value: "5" } })
    fireEvent.blur(input)
    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1))
    fireEvent.change(input, { target: { value: "9" } })
    fireEvent.change(input, { target: { value: "5" } })

    // PATCH(5) dorazi uspesne - zobrazena hodnota uz odpovida potvrzene, dirty nesmi zustat
    deferred.resolve(createMembership(1, 5))
    await waitForMutationsSettled(queryClient)

    const eventDirty = new Event("beforeunload", { cancelable: true })
    window.dispatchEvent(eventDirty)
    expect(eventDirty.defaultPrevented).toBe(false)
})

// zrcadlo predchoziho testu, ale s navratem AZ PO dobehnuti PATCHe: `.then()` uz probehl,
// takze dirty nema kdo shodit - bez kontroly primo v onChange zustane viset natrvalo
// a efekt s fresh daty z props uz hodnotu nikdy neprepise (dep se podruhe nezmeni)
test("returning to the confirmed value after the PATCH settled clears dirty too", async () => {
    patchMock.mockResolvedValue(createMembership(1, 7))
    const { queryClient, refetchMemberships } = await renderPrepaidCounters([
        createMembership(1, 3),
    ])
    const input = screen.getByRole("textbox")

    // ulozi 7 a necha PATCH dobehnout
    fireEvent.change(input, { target: { value: "7" } })
    fireEvent.blur(input)
    await waitForMutationsSettled(queryClient)
    // invalidace po mutaci v realne aplikaci dorucí ulozenou hodnotu zpatky do props
    refetchMemberships([createMembership(1, 7)])

    // pak beze bluru prepise na 9 a hned zpatky na 7 (nic neulozeneho nezustava)
    fireEvent.change(input, { target: { value: "9" } })
    fireEvent.change(input, { target: { value: "7" } })

    const eventDirty = new Event("beforeunload", { cancelable: true })
    window.dispatchEvent(eventDirty)
    expect(eventDirty.defaultPrevented).toBe(false)

    // a hlavne: externi zmena (jina zalozka, dekrement po lekci) se musi propsat do UI
    refetchMemberships([createMembership(1, 12)])
    expect(input).toHaveValue("12")
})

// Zavreni tabu blur ani unmount nezaruci - prohlizec musi varovat pres beforeunload
test("beforeunload is prevented only while an edit is unsaved", async () => {
    patchMock.mockResolvedValue(createMembership(1, 7))
    const { queryClient } = await renderPrepaidCounters([createMembership(1, 3)])
    const input = screen.getByRole("textbox")

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

// Po SELHANEM PATCHi neni jiste, jestli se ztratil pozadavek, nebo az odpoved. Kdyz se
// ukaze, ze server hodnotu prijal (props ji prinesou), musi se pole zase napojit na server -
// jinak zustane "neulozene" navzdy: bezduvodne blokuje zavreni tabu, ignoruje vsechny dalsi
// serverove zmeny a pri unmountu jeste prepise novejsi serverovou hodnotu tou svou
test("re-attaches to the server when props confirm a value whose PATCH had failed", async () => {
    patchMock.mockRejectedValue(new Error("network error"))
    const { queryClient, refetchMemberships } = await renderPrepaidCounters([
        createMembership(1, 5),
    ])
    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "7" } })
    fireEvent.blur(input)
    await waitForMutationsSettled(queryClient)

    // server hodnotu PRESTO prijal (ztratila se az odpoved) a refetch ji prinese
    refetchMemberships([createMembership(1, 7)])
    const ev = new Event("beforeunload", { cancelable: true })
    window.dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(false)

    // a pozdejsi externi zmena se musi propsat
    refetchMemberships([createMembership(1, 6)])
    expect(input).toHaveValue("6")
})
