import React from "react"
import { clientName } from "../../global/utils"
import CustomReactSelect from "./CustomReactSelect"
import { react_select_ids } from "./func"

const SelectClient = ({ value, onChangeCallback, options }) => (
    <CustomReactSelect
        {...react_select_ids("client")}
        value={value}
        getOptionLabel={option => clientName(option)}
        getOptionValue={option => option.id}
        onChange={newValue => onChangeCallback(newValue, "client")}
        options={options}
        placeholder={"Vyberte existujícího klienta..."}
        required
        autoFocus
    />
)

export default SelectClient
