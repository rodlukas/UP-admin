import { useMutation, useQueryClient } from "@tanstack/react-query"

import { MembershipPatchApi, MembershipType } from "../../types/models"
import MembershipService from "../services/MembershipService"

/** Hook pro částečnou aktualizaci členství. */
export function usePatchMembership() {
    const queryClient = useQueryClient()

    return useMutation<MembershipType, unknown, MembershipPatchApi>({
        mutationFn: (data) => MembershipService.patch(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["groups"] })
        },
    })
}
