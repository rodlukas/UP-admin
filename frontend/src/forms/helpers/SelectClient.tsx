import { Select } from "@mantine/core"
import * as React from "react"

import { TEXTS } from "../../global/constants"
import { clientName } from "../../global/utils"
import { ClientType } from "../../types/models"

import * as styles from "./SelectClient.css"

type SelectClientProps = {
    /** Vybraný klient. */
    value?: ClientType | null
    /** Seznam klientů. */
    options?: readonly ClientType[]
    /** Funkce volaná při výběru klienta. */
    onChangeCallback: (name: "client", newValue?: ClientType | null) => void
    /** Automaticky zaměřit vstup (defaultně true). */
    autoFocus?: boolean
    /** Povinné pole (vizuální, validace probíhá v nadřazeném formuláři). */
    required?: boolean
    /** Popisek pole (předán Mantine Select jako label). */
    label?: string
    /** Chybová zpráva pod polem (validaci povinného pole řídí nadřazený formulář). */
    error?: React.ReactNode
    /**
     * DOM id selectu — výchozí hodnotu "client" hledají E2E testy (`By.ID "client"`),
     * vlastní id zasílej jen pokud by mohly být současně namountované dvě instance.
     */
    id?: string
}

/** Komponenta s Mantine Select pro výběr klienta. */
const SelectClient: React.FC<SelectClientProps> = ({
    value,
    onChangeCallback,
    options = [],
    autoFocus = true,
    required,
    label,
    error,
    id = "client",
}) => {
    // Čerstvě vytvořený klient (přes "přidat nového") se do `value` dostane dřív, než ho
    // asynchronní refetch přidá do `options`; bez doplnění by Select zobrazil prázdno.
    const data = React.useMemo(() => {
        const items = options.map((c) => ({ value: c.id.toString(), label: clientName(c) }))
        if (value && !options.some((c) => c.id === value.id)) {
            items.push({ value: value.id.toString(), label: clientName(value) })
        }
        return items
    }, [options, value])

    return (
        <Select
            id={id}
            data={data}
            value={value?.id.toString() ?? null}
            onChange={(val) => {
                // i čerstvě vytvořený klient (zatím mimo `options`, viz `data` memo) musí jít
                // znovu vybrat – když `val` odpovídá aktuální hodnotě, vrať ji přímo
                const found =
                    value?.id.toString() === val
                        ? value
                        : (options.find((c) => c.id.toString() === val) ?? null)
                onChangeCallback("client", found)
            }}
            label={label}
            // bez viditelného labelu (volající, který `label` nepředal) by select neměl
            // přístupný název; `aria-label` má v accessible name computation přednost
            // před přiřazeným <label>, proto ho nastav jen když viditelný label chybí
            aria-label={label ? undefined : "Klient"}
            placeholder="Vyberte existujícího klienta…"
            searchable
            nothingFoundMessage={TEXTS.NO_RESULTS}
            clearable={!required}
            // bez tohohle jde povinnou hodnotu vynulovat i překliknutím už vybrané položky
            // v otevřeném dropdownu (Mantine `allowDeselect` je jinak defaultně `true`)
            allowDeselect={!required}
            autoFocus={autoFocus}
            withAsterisk={required}
            required={required}
            error={error}
            renderOption={({ option }) => <span data-gdpr>{option.label}</span>}
            classNames={{ input: styles.gdprInput }}
        />
    )
}

export default SelectClient
