import { Select } from "@mantine/core"
import * as React from "react"

import { TEXTS } from "../../global/constants"
import { clientName, withSelectedOptions } from "../../global/utils"
import { type ClientType } from "../../types/models"

import * as styles from "./SelectClient.css"

type SelectClientProps = {
    /** Vybraný klient. */
    value?: ClientType | null
    /** Seznam klientů. */
    options?: readonly ClientType[]
    /** Funkce volaná při výběru klienta. */
    onChangeCallback: (name: "client", newValue?: ClientType | null) => void
    /** Povinné pole (vizuální, validace probíhá v nadřazeném formuláři). */
    required?: boolean
    /** Popisek pole (předán Mantine Select jako label). */
    label?: string
    /** Chybová zpráva pod polem (validaci povinného pole řídí nadřazený formulář). */
    error?: React.ReactNode
    /**
     * Klienty se nepodařilo načíst (`true`) — prázdný seznam pak NENÍ „žádní klienti
     * neexistují" a nesmí tak vypadat, jinak uživatel založí přihlášku/lekci v domnění,
     * že hledaný klient v systému není. Zdroj klientů se liší podle volajícího (všichni
     * vs. jen aktivní z kontextu), takže si to komponenta sama odvodit nemůže.
     */
    optionsUnavailable?: boolean
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
    required,
    label,
    error,
    optionsUnavailable = false,
    id = "client",
}) => {
    // Čerstvě vytvořený klient (přes "přidat nového") se do `value` dostane dřív, než ho
    // asynchronní refetch přidá do `options`; bez doplnění by Select zobrazil prázdno.
    const data = React.useMemo(
        () =>
            withSelectedOptions(options, value ? [value] : []).map((c) => ({
                value: c.id.toString(),
                label: clientName(c),
            })),
        [options, value],
    )

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
            nothingFoundMessage={
                optionsUnavailable ? "Klienty se nepodařilo načíst" : TEXTS.NO_RESULTS
            }
            clearable={!required}
            // bez tohohle jde povinnou hodnotu vynulovat i překliknutím už vybrané položky
            // v otevřeném dropdownu (Mantine `allowDeselect` je jinak defaultně `true`)
            allowDeselect={!required}
            // Žádný `autoFocus`: uvnitř modalu (jediné místo, kde se komponenta používá)
            // se o počáteční focus stará Mantine `FocusTrap` sám — bez explicitní značky
            // ho dá na modalovou hlavičku (zavírací křížek), ne na pole. Autofocus na
            // `searchable` Select by navíc hned otevřel dropdown nad zbytkem formuláře.
            withAsterisk={required}
            required={required}
            error={error}
            renderOption={({ option }) => <span data-gdpr>{option.label}</span>}
            classNames={{ input: styles.gdprInput }}
        />
    )
}

export default SelectClient
