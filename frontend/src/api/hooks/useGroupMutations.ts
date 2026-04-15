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

/** Hook pro hromadné přesunutí aktivních skupin bez lekce v poslední době do neaktivních. */
export function useDeactivateGroups() {
    return useMutation<void, unknown, GroupType["id"][]>({
        mutationFn: (ids) =>
            Promise.all(ids.map((id) => GroupService.deactivate(id))).then(() => undefined),
        meta: {
            successMessage: "Skupiny přesunuty do neaktivních",
        },
    })
}
