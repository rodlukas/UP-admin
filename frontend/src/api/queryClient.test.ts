import { createQueryClient } from "./queryClient"

vi.mock("@mantine/notifications", () => ({ notifications: { show: vi.fn() } }))

describe("createQueryClient – invalidace po mutaci", () => {
    test("smazaný záznam z deletedQueryKey se nerefetchuje, ostatní ano", async () => {
        const queryClient = createQueryClient()
        const keys = {
            deleted: ["clients", 5],
            other: ["clients", 6],
            list: ["clients", { type: "active" }],
            bank: ["bank"],
        }
        for (const key of Object.values(keys)) {
            queryClient.setQueryData(key, {})
        }

        await queryClient
            .getMutationCache()
            .build(queryClient, {
                mutationFn: () => Promise.resolve({}),
                meta: { deletedQueryKey: (id: number) => ["clients", id] },
            })
            .execute(5)

        const isInvalidated = (key: readonly unknown[]): boolean | undefined =>
            queryClient.getQueryState(key)?.isInvalidated
        expect(isInvalidated(keys.deleted)).toBe(false)
        expect(isInvalidated(keys.bank)).toBe(false)
        expect(isInvalidated(keys.other)).toBe(true)
        expect(isInvalidated(keys.list)).toBe(true)
    })
})
