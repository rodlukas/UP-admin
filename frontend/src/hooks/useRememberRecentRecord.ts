import * as React from "react"

import { RecentRecord, rememberRecentRecord } from "../global/recentRecords"

/**
 * Zapamatuje otevřenou kartu pro paletu příkazů (⌘K), která ji pak nabídne
 * mezi naposledy otevřenými.
 *
 * Druh a id se předávají zvlášť, ne jako objekt: ten by měl při každém renderu novou
 * identitu a efekt by se pouštěl pořád dokola.
 *
 * `enabled` musí být `false`, dokud karta nepotvrdí, že záznam skutečně existuje (dotaz
 * ještě běží nebo skončil chybou/404) — jinak by se do pětislotového seznamu zapsalo
 * i rozbité `id` z URL (např. `NaN` z nečíselného segmentu) nebo smazaný záznam, které
 * v paletě nikdy nejde zobrazit, a natrvalo by vytlačilo funkční položky.
 */
export const useRememberRecentRecord = (
    kind: RecentRecord["kind"],
    id: number,
    enabled: boolean,
): void => {
    React.useEffect(() => {
        if (enabled && Number.isFinite(id)) {
            rememberRecentRecord({ kind, id })
        }
    }, [kind, id, enabled])
}
