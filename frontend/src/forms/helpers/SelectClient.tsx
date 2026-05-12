import { Select } from "@mantine/core"
import * as React from "react"

import { clientName } from "../../global/utils"
import { ClientType } from "../../types/models"

type SelectClientProps = {
    /** Vybraný klient. */
    value?: ClientType | null
    /** Seznam klientů. */
    options?: readonly ClientType[]
    /** Funkce volaná při výběru klienta. */
    onChangeCallback: (name: "client", newValue?: ClientType | null) => void
    /** Automaticky zaměřit vstup. */
    autoFocus?: boolean
    /** Povinné pole (vizuální, validace probíhá v nadřazeném formuláři). */
    required?: boolean
}

/** Komponenta s Mantine Select pro výběr klienta. */
const SelectClient: React.FC<SelectClientProps> = ({ value, onChangeCallback, options = [], autoFocus }) => {
    const data = options.map((c) => ({ value: c.id.toString(), label: clientName(c) }))

    return (
        <Select
            id="client"
            data={data}
            value={value?.id.toString() ?? null}
            onChange={(val) => {
                const found = options.find((c) => c.id.toString() === val) ?? null
                onChangeCallback("client", found)
            }}
            placeholder="Vyberte existujícího klienta..."
            searchable
            clearable
            autoFocus={autoFocus}
            comboboxProps={{ withinPortal: true }}
        />
    )
}

export default SelectClient
