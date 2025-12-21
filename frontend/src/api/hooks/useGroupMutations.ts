import { useMutation } from "@tanstack/react-query"

import { GroupPostApi, GroupPutApi, GroupType } from "../../types/models"
import GroupService from "../services/GroupService"

/** Hook pro vytvoření skupiny. */
export function useCreateGroup() {
    return useMutation<GroupType, unknown, GroupPostApi>({
        mutationFn: (data) => GroupService.create(data),
        meta: {
            successMessage: "Skupina uložena",
        },
    })
}

/** Hook pro aktualizaci skupiny. */
export function useUpdateGroup() {
    return useMutation<GroupType, unknown, GroupPutApi>({
        mutationFn: (data) => GroupService.update(data),
        meta: {
            successMessage: "Skupina uložena",
        },
    })
}

/** Hook pro smazání skupiny. */
export function useDeleteGroup() {
    return useMutation<GroupType, unknown, GroupType["id"]>({
        mutationFn: (id) => GroupService.remove(id),
        meta: {
            successMessage: "Skupina smazána",
        },
    })
}
