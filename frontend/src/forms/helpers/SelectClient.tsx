import * as React from "react"
import { Props } from "react-select"
import { clientName } from "../../global/utils"
import { ClientType } from "../../types/models"
import CustomReactSelect from "./CustomReactSelect"
import { reactSelectIds } from "./func"

type SelectClientProps = Props<ClientType> & {
    onChangeCallback: (name: "client", newValue: ClientType | undefined | null) => void
}

const SelectClient: React.FunctionComponent<SelectClientProps> = ({
    value,
    onChangeCallback,
    options
}) => (
    <CustomReactSelect<ClientType>
        {...reactSelectIds("client")}
        value={value}
        getOptionLabel={(option): string => clientName(option)}
        getOptionValue={(option): string => option.id.toString()}
        onChange={(newValue): void =>
            onChangeCallback("client", newValue as ClientType | null | undefined)
        }
        options={options}
        placeholder={"Vyberte existujícího klienta..."}
        required
        autoFocus
    />
)

export default SelectClient
