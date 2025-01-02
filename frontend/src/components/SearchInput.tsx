import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"
import { Input, InputGroup, Label } from "reactstrap"

import { useClientsActiveContext } from "../contexts/ClientsActiveContext"

import "./SearchInput.css"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = {
    /** Funkce, která se zavolá při úpravě vyhledávaného výrazu. */
    onSearchChange: (newSearchVal: string) => void
    /** Vyhledávaný výraz. */
    searchVal: string
}

/** Komponenta zobrazující pole pro vyhledávání. */
const SearchInput: React.FC<Props> = (props) => {
    // destructuring kvuli useEffect deps (viz https://github.com/rodlukas/UP-admin/issues/96)
    const { funcRefresh: clientsActiveContextFuncRefresh } = useClientsActiveContext()

    React.useEffect(() => {
        clientsActiveContextFuncRefresh()
    }, [clientsActiveContextFuncRefresh])

    function onSearchChange(e: React.ChangeEvent<HTMLInputElement>): void {
        props.onSearchChange(e.currentTarget.value)
    }

    return (
        <InputGroup className="Search">
            <Label id="Search" className="input-group-text" for="search">
                <FontAwesomeIcon icon={faSearch} fixedWidth />
            </Label>
            <UncontrolledTooltipWrapper placement="left" target="Search">
                Vyhledávání klientů
            </UncontrolledTooltipWrapper>
            <Input
                onChange={onSearchChange}
                placeholder="Vyhledat klienta..."
                value={props.searchVal}
                type="search"
                id="search"
                autoComplete="off"
            />
        </InputGroup>
    )
}

export default SearchInput
