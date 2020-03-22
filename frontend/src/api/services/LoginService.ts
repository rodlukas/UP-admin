import { AuthorizationType, TokenApiType } from "../../types/models"
import { requestData } from "../request"
import { API_DELIM, API_METHODS, API_URLS } from "../urls"

const baseUrl = API_URLS.Login

/** Získá nový JWT token s obnovenou platností na základě zaslaného stávajícího JWT tokenu. */
function refresh(context: TokenApiType): Promise<TokenApiType> {
    return requestData<TokenApiType>({
        url: baseUrl.url + baseUrl.action.refresh + API_DELIM,
        method: API_METHODS.post,
        data: context,
    })
}

/** Získá JWT token prostřednictvím zadaných přihlašovacích údajů. */
function authenticate(context: AuthorizationType): Promise<TokenApiType> {
    return requestData<TokenApiType>({
        url: baseUrl.url + baseUrl.action.authenticate + API_DELIM,
        method: API_METHODS.post,
        data: context,
    })
}

const LoginService = {
    refresh,
    authenticate,
}

export default LoginService
