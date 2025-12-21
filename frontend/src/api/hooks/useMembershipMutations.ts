import { useMutation } from "@tanstack/react-query"

import { MembershipPatchApi, MembershipType } from "../../types/models"
import MembershipService from "../services/MembershipService"

/** Hook pro částečnou aktualizaci členství. */
export function usePatchMembership() {
    return useMutation<MembershipType, unknown, MembershipPatchApi>({
        mutationFn: (data) => MembershipService.patch(data),
        meta: {
            successMessage: "Předplacené lekce uloženy",
        },
    })
}
