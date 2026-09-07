import { QueryClientProvider, useQuery } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"

import { createQueryClient } from "../api/queryClient"

import TopProgressBar from "./TopProgressBar"
import * as styles from "./TopProgressBar.css"

/** Promise s ručně ovládaným resolvnutím — simulace requestu "v letu". */
function createDeferred(): { promise: Promise<void>; resolve: () => void } {
    let resolve!: () => void
    const promise = new Promise<void>((res) => {
        resolve = res
    })
    return { promise, resolve }
}

/** Vyvolá jeden dotaz React Query s dodaným `queryFn` — řídí, kdy přesně "dofetchuje". */
function TriggerQuery({ queryFn }: { queryFn: () => Promise<void> }): null {
    useQuery({ queryKey: ["top-progress-bar-test"], queryFn, staleTime: 0, gcTime: 0 })
    return null
}

function renderWithFetch(queryFn: () => Promise<void>): void {
    const queryClient = createQueryClient()
    render(
        <QueryClientProvider client={queryClient}>
            <TopProgressBar />
            <TriggerQuery queryFn={queryFn} />
        </QueryClientProvider>,
    )
}

test("the bar appears immediately, without a show delay", async () => {
    const deferred = createDeferred()
    renderWithFetch(() => deferred.promise)

    // tesny timeout: kdyby se pruh objevoval az po nejakem zpozdeni, test by to odhalil
    await screen.findByTestId("global-loading", {}, { timeout: 100 })

    deferred.resolve()
})

test("stays in progress (not marked done) while the fetch is still running", async () => {
    const deferred = createDeferred()
    renderWithFetch(() => deferred.promise)
    const bar = await screen.findByTestId("loading-bar", {}, { timeout: 100 })

    // necha probehnout par trickle ticku - porad se ceka na fetch, nesmi doskocit na 100 %
    await new Promise((resolve) => {
        globalThis.setTimeout(resolve, 500)
    })
    expect(bar).not.toHaveClass(styles.barDone)

    deferred.resolve()
})

test("snaps to done as soon as the fetch resolves, then unmounts", async () => {
    const deferred = createDeferred()
    renderWithFetch(() => deferred.promise)
    await screen.findByTestId("global-loading", {}, { timeout: 100 })

    deferred.resolve()

    await waitFor(() => expect(screen.getByTestId("loading-bar")).toHaveClass(styles.barDone))

    await waitFor(() => expect(screen.queryByTestId("global-loading")).not.toBeInTheDocument(), {
        timeout: 1000,
    })
})
