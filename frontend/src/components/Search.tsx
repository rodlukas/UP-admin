import { faSearch } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as React from "react"
import { Input, InputGroup, InputGroupAddon, Label } from "reactstrap"
import { ClientsActiveContext } from "../contexts/ClientsActiveContext"
import "./Search.css"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = {
    /** Funkce, která se zavolá při úpravě vyhledávaného výrazu. */
    onSearchChange: (newSearchVal: string) => void
    /** Vyhledávaný výraz. */
    searchVal: string
}

/** Komponenta zobrazující pole pro vyhledávání. */
const Search: React.FC<Props> = (props) => {
    // destructuring kvuli useEffect deps (viz https://github.com/rodlukas/UP-admin/issues/96)
    const { funcRefresh: clientsActiveContextFuncRefresh } = React.useContext(ClientsActiveContext)

    React.useEffect(() => {
        clientsActiveContextFuncRefresh()
    }, [clientsActiveContextFuncRefresh])

    function onSearchChange(e: React.ChangeEvent<HTMLInputElement>): void {
        props.onSearchChange(e.currentTarget.value)
    }

    return (
        <InputGroup className="Search">
            <InputGroupAddon id="Search" addonType="prepend">
                <Label className="input-group-text" for="search">
                    <FontAwesomeIcon icon={faSearch} fixedWidth />
                </Label>
            </InputGroupAddon>
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

export default Search
