import { useMutation } from "@tanstack/react-query"

import Token from "../../auth/Token"
import { AuthorizationType, TokenApiType } from "../../types/models"
import LoginService from "../services/LoginService"

/** Hook pro přihlášení uživatele. */
export function useLogin() {
    return useMutation<TokenApiType, unknown, AuthorizationType>({
        mutationFn: (credentials) => LoginService.authenticate(credentials),
        // Bez `"always"` TanStack Query mutaci offline POZASTAVI a promise z `mutateAsync`
        // se nikdy neusadi (overeno sondou) — prihlasovaci tlacitko by tocilo donekonecna,
        // globalni `mutationCache.onError` by se nespustil a uzivatel by se na vstupni
        // obrazovce aplikace nedozvedel vubec nic. S "always" pokus rovnou selze.
        networkMode: "always",
        onSuccess: (data) => {
            Token.save(data.token)
        },
        meta: {
            skipSuccessNotification: true,
        },
    })
}
