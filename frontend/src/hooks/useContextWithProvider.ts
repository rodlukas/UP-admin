import * as React from "react"

/**
 * Hook, který ošetřuje pokus u konzumaci contextu pokud ve stromu není provider.
 * Vyhodíme chybu a renderování aplikace skončí.
 * */
export const useContextWithProvider = <A>(Context: React.Context<A | undefined>): A => {
    const context = React.useContext(Context)
    if (context === undefined) {
        throw new Error("Provider is missing in tree - unable to consume context.")
    }
    return context
}
