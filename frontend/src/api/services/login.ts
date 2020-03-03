import { AuthorizationType, TokenApiType } from "../../types/models"
import { requestData } from "../request"
import { API_DELIM, API_METHODS, API_URLS } from "../urls"

const baseUrl = API_URLS.Login

function refresh(context: TokenApiType): Promise<TokenApiType> {
    return requestData<TokenApiType>({
        url: baseUrl.url + baseUrl.action.refresh + API_DELIM,
        method: API_METHODS.post,
        data: context
    })
}

function authenticate(context: AuthorizationType): Promise<TokenApiType> {
    return requestData<TokenApiType>({
        url: baseUrl.url + baseUrl.action.authenticate + API_DELIM,
        method: API_METHODS.post,
        data: context
    })
}

const LoginService = {
    refresh,
    authenticate
}

export default LoginService
