import { MembershipPatchApi, MembershipType } from "../../types/models"
import { requestData } from "../request"
import { API_DELIM, API_METHODS, API_URLS } from "../urls"

const baseUrl = API_URLS.Memberships.url

type Item = MembershipType

/** Aktualizuje (PATCH) členství ve skupině. */
function patch(context: MembershipPatchApi): Promise<Item> {
    return requestData<Item>({
        url: baseUrl + context.id + API_DELIM,
        method: API_METHODS.patch,
        data: context
    })
}

const MembershipService = {
    patch
}

export default MembershipService
