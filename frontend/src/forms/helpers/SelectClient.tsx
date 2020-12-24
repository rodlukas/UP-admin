import * as React from "react"
import { Props } from "react-select"

import { clientName } from "../../global/utils"
import { ClientType } from "../../types/models"

import { reactSelectIds } from "./func"
import ReactSelectWrapper from "./ReactSelectWrapper"

type SelectClientProps = Props<ClientType> & {
    /** Funkce, která se zavolá při vybrání klienta. */
    onChangeCallback: (name: "client", newValue?: ClientType | null) => void
}

/** Komponenta s react-select pro klienta. */
const SelectClient: React.FC<SelectClientProps> = ({ value, onChangeCallback, options }) => (
    <ReactSelectWrapper<ClientType>
        {...reactSelectIds("client")}
        value={value}
        getOptionLabel={(option): string => clientName(option)}
        getOptionValue={(option): string => option.id.toString()}
        onChange={(newValue): void => onChangeCallback("client", newValue)}
        options={options}
        placeholder={"Vyberte existujícího klienta..."}
        required
        autoFocus
    />
)

export default SelectClient
