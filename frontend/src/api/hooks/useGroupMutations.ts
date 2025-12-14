import { useMutation, useQueryClient } from "@tanstack/react-query"

import { GroupPostApi, GroupPutApi, GroupType } from "../../types/models"
import GroupService from "../services/GroupService"

/** Hook pro vytvoření skupiny. */
export function useCreateGroup() {
    const queryClient = useQueryClient()

    return useMutation<GroupType, unknown, GroupPostApi>({
        mutationFn: (data) => GroupService.create(data),
        onSuccess: () => {
            // Invalidovat cache pro skupiny (invaliduje i ["groups", "active"], ["groups", "inactive"], atd.)
            void queryClient.invalidateQueries({ queryKey: ["groups"] })
        },
    })
}

/** Hook pro aktualizaci skupiny. */
export function useUpdateGroup() {
    const queryClient = useQueryClient()

    return useMutation<GroupType, unknown, GroupPutApi>({
        mutationFn: (data) => GroupService.update(data),
        onSuccess: (data) => {
            // Aktualizovat konkrétní skupinu v cache
            queryClient.setQueryData(["groups", data.id], data)
            // Invalidovat cache pro skupiny (invaliduje i ["groups", "active"], ["groups", "inactive"], atd.)
            void queryClient.invalidateQueries({ queryKey: ["groups"] })
        },
    })
}

/** Hook pro smazání skupiny. */
export function useDeleteGroup() {
    const queryClient = useQueryClient()

    return useMutation<GroupType, unknown, GroupType["id"]>({
        mutationFn: (id) => GroupService.remove(id),
        onSuccess: () => {
            // Invalidovat cache pro skupiny (invaliduje i ["groups", "active"], ["groups", "inactive"], atd.)
            void queryClient.invalidateQueries({ queryKey: ["groups"] })
        },
    })
}
