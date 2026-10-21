import { QueryClientProvider, QueryObserver } from "@tanstack/react-query"
import { act, renderHook } from "@testing-library/react"
import * as React from "react"

import { useDeleteClient } from "./hooks"
import { createQueryClient } from "./queryClient"
import ClientService from "./services/ClientService"

vi.mock("@mantine/notifications", () => ({ notifications: { show: vi.fn() } }))
vi.mock("./services/ClientService", () => ({ default: { remove: vi.fn() } }))

const DELETED_ID = 5

describe("createQueryClient – invalidation after a mutation", () => {
    test("does not refetch the deleted client, but refetches everything else except the bank", async () => {
        vi.mocked(ClientService).remove.mockResolvedValue(undefined as never)
        const queryClient = createQueryClient()
        const queryFns = {
            deleted: vi.fn().mockResolvedValue({}),
            other: vi.fn().mockResolvedValue({}),
            bank: vi.fn().mockResolvedValue({}),
        }
        const keys = {
            deleted: ["clients", DELETED_ID],
            other: ["clients", { type: "active" }],
            bank: ["bank"],
        }
        // aktivni observery = otevrena karta smazaneho klienta, seznam a banka
        const unsubscribers = (Object.keys(keys) as (keyof typeof keys)[]).map((name) =>
            new QueryObserver(queryClient, {
                queryKey: keys[name],
                queryFn: queryFns[name],
            }).subscribe(() => undefined),
        )
        await vi.waitFor(() => {
            Object.values(queryFns).forEach((fn) => expect(fn).toHaveBeenCalledTimes(1))
        })

        const { result } = renderHook(() => useDeleteClient(), {
            wrapper: ({ children }: { children: React.ReactNode }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            ),
        })
        await act(() => result.current.mutateAsync(DELETED_ID))

        await vi.waitFor(() => expect(queryFns.other).toHaveBeenCalledTimes(2))
        expect(queryFns.deleted).toHaveBeenCalledTimes(1)
        expect(queryFns.bank).toHaveBeenCalledTimes(1)
        // smazany zaznam je jen oznaceny jako zastaraly - navrat na kartu ho nacte znovu
        expect(queryClient.getQueryState(keys.deleted)?.isInvalidated).toBe(true)
        expect(queryClient.getQueryState(keys.bank)?.isInvalidated).toBe(false)

        unsubscribers.forEach((unsubscribe) => unsubscribe())
    })
})
