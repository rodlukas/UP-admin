import { useMutation } from "@tanstack/react-query"

import Token from "../../auth/Token"
import { AuthorizationType, TokenApiType } from "../../types/models"
import LoginService from "../services/LoginService"

/** Hook pro přihlášení uživatele. */
export function useLogin() {
    return useMutation<TokenApiType, unknown, AuthorizationType>({
        mutationFn: (credentials) => LoginService.authenticate(credentials),
        onSuccess: (data) => {
            Token.save(data.token)
        },
        meta: {
            skipSuccessNotification: true,
        },
    })
}
