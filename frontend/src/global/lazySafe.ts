import * as React from "react"

/**
 * Pokud se nenajde chunk na serveru, proved PRAVE jednou reload cele aplikace -
 * pri deploy se muze stat, ze klient ma v cache stary manifest.json se starym hashem chunku,
 * ktery pak pozaduje, dojde k chybe, kterou odchytime a provedeme hard refresh cele aplikace.
 *
 * Pokud se ale chunk nenacetl z jineho duvodu, nastalo by zacykleni, proto pres localStorage
 * povolime jen jedno znovunacteni.
 *
 * Viz:
 * https://github.com/facebook/react/issues/14254,
 * https://medium.com/@kamrankhatti/angular-lazy-routes-loading-chunk-failed-42b16c22a377,
 * https://blog.francium.tech/vue-lazy-routes-loading-chunk-failed-9ee407bbd58
 */
export default function lazySafe(
    fn: () => Promise<{ readonly default?: React.ComponentType<any> }>
): Promise<any> {
    const FIRST_RELOAD_KEY = "firstReload"
    return new Promise((resolve, reject) => {
        fn()
            .then(resolve)
            .catch((error) => {
                // zjisti, jestli se nepodarilo nacist chunk
                // muze dorazit:
                //  1. Loading chunk 11 failed.
                //  2. Loading CSS chunk 11 failed.
                if (
                    error instanceof Error &&
                    /loading(?: css)? chunk \d* failed./i.test(error.message)
                ) {
                    // zjisti, zda uz doslo k prvnimu automatickemu reloadu
                    const curValue = localStorage.getItem(FIRST_RELOAD_KEY)
                    if (curValue === null || curValue !== "true") {
                        // pokud nedoslo k prvnimu reloadu, nastav firstReload="true" a reloadni
                        localStorage.setItem(FIRST_RELOAD_KEY, "true")
                        window.location.reload()
                    } else {
                        localStorage.removeItem(FIRST_RELOAD_KEY)
                    }
                }
                // nejedna se o chybu s chunkem, posli dal
                else {
                    reject(error)
                }
            })
    })
}
