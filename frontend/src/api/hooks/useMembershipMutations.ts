import { useMutation } from "@tanstack/react-query"

import { type MembershipPatchApi, type MembershipType } from "../../types/models"
import MembershipService from "../services/MembershipService"

/**
 * Hook pro částečnou aktualizaci členství.
 *
 * `scope` (z `membershipId`) — mutace se stejným `scope.id` TanStack Query řadí ZA SEBE
 * místo paralelně (další čeká v `isPaused`, dokud předchozí nedoběhne). Bez toho mohly nad
 * jedním polem letět dva PATCHe naráz a server je zpracovat v opačném pořadí, než v jakém
 * odešly — skončil by na starší hodnotě a z odpovědí to poznat nejde. Scope je per členství,
 * takže ukládání různých členů skupiny běží dál souběžně.
 */
export function usePatchMembership(membershipId: MembershipType["id"]) {
    return useMutation<MembershipType, unknown, MembershipPatchApi>({
        mutationFn: (data) => MembershipService.patch(data),
        scope: { id: `membership-${membershipId}` },
        // Bez `"always"` TanStack Query mutaci offline POZASTAVI a promise z `mutateAsync`
        // (viz `commit()` v PrepaidCounters.tsx) se nikdy neusadi — pole by zůstalo natrvalo
        // ve stavu "pending" bez jakékoli hlášky, stejný důvod jako u `useLogin`.
        networkMode: "always",
        meta: {
            successMessage: "Předplacené lekce uloženy",
        },
    })
}
