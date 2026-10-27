import { QueryClientProvider, QueryObserver } from "@tanstack/react-query"
import { act, renderHook } from "@testing-library/react"
import * as React from "react"

import { type ClientType, type GroupType } from "../types/models"

import { useDeleteClient, useDeleteGroup } from "./hooks"
import { createQueryClient } from "./queryClient"
import ClientService from "./services/ClientService"
import GroupService from "./services/GroupService"

vi.mock("@mantine/notifications", () => ({ notifications: { show: vi.fn() } }))
vi.mock("./services/ClientService", () => ({ default: { remove: vi.fn() } }))
vi.mock("./services/GroupService", () => ({ default: { remove: vi.fn() } }))

const DELETED_ID = 5

// mazací mutace s `deletedQueryKey`: bez něj by karta smazaného záznamu dostala 404
// a handleError by ji přesměroval na „Nenalezeno“ dřív, než se naviguje zpět na seznam
const DELETIONS: {
    entity: string
    mockRemove: () => void
    useDelete: () => (id: number) => Promise<unknown>
}[] = [
    {
        entity: "clients",
        mockRemove: () =>
            vi.mocked(ClientService).remove.mockResolvedValue({ id: DELETED_ID } as ClientType),
        useDelete: () => useDeleteClient().mutateAsync,
    },
    {
        entity: "groups",
        mockRemove: () =>
            vi.mocked(GroupService).remove.mockResolvedValue({ id: DELETED_ID } as GroupType),
        useDelete: () => useDeleteGroup().mutateAsync,
    },
]

describe("createQueryClient – invalidation after a mutation", () => {
    test.each(DELETIONS)(
        "does not refetch the deleted $entity detail, but refetches everything else except the bank",
        async ({ entity, mockRemove, useDelete }) => {
            mockRemove()
            const queryClient = createQueryClient()
            const queryFns = {
                deleted: vi.fn().mockResolvedValue({}),
                other: vi.fn().mockResolvedValue({}),
                bank: vi.fn().mockResolvedValue({}),
            }
            const keys = {
                deleted: [entity, DELETED_ID],
                other: [entity, { type: "active" }],
                bank: ["bank"],
            }
            // aktivni observery = otevrena karta smazaneho zaznamu, seznam a banka
            const unsubscribers = (Object.keys(keys) as (keyof typeof keys)[]).map((name) =>
                new QueryObserver(queryClient, {
                    queryKey: keys[name],
                    queryFn: queryFns[name],
                }).subscribe(() => undefined),
            )
            await vi.waitFor(() => {
                Object.values(queryFns).forEach((fn) => expect(fn).toHaveBeenCalledTimes(1))
            })

            const { result } = renderHook(() => useDelete(), {
                wrapper: ({ children }: { children: React.ReactNode }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            })
            await act(() => result.current(DELETED_ID))

            await vi.waitFor(() => expect(queryFns.other).toHaveBeenCalledTimes(2))
            expect(queryFns.deleted).toHaveBeenCalledTimes(1)
            expect(queryFns.bank).toHaveBeenCalledTimes(1)
            // smazany zaznam je jen oznaceny jako zastaraly - navrat na kartu ho nacte znovu
            expect(queryClient.getQueryState(keys.deleted)?.isInvalidated).toBe(true)
            expect(queryClient.getQueryState(keys.bank)?.isInvalidated).toBe(false)

            unsubscribers.forEach((unsubscribe) => unsubscribe())
        },
    )
})
