import React from "react"
import Select from "react-select"
import { TEXTS } from "../../global/constants"
import { clientName } from "../../global/utils"
import { react_select_ids } from "./func"

const SelectClient = ({ value, onChangeCallback, options }) => (
    <Select
        {...react_select_ids("client")}
        value={value}
        getOptionLabel={option => clientName(option)}
        getOptionValue={option => option.id}
        onChange={newValue => onChangeCallback(newValue, "client")}
        options={options}
        placeholder={"Vyberte existujícího klienta..."}
        noOptionsMessage={() => TEXTS.NO_RESULTS}
        required
        autoFocus
    />
)

export default SelectClient
