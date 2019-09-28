import { faSearch } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { useContext, useEffect } from "react"
import { Input, InputGroup, InputGroupAddon, Label } from "reactstrap"
import { ClientsActiveContext } from "../contexts/ClientsActiveContext"
import "./Search.css"

const Search = props => {
    const clientsActiveContext = useContext(ClientsActiveContext)

    useEffect(() => {
        clientsActiveContext.funcRefresh()
    }, [])

    function onSearchChange(e) {
        props.onSearchChange(e.target.value)
    }

    return (
        <InputGroup className="Search">
            <InputGroupAddon title="Vyhledávání klientů" addonType="prepend">
                <Label className="input-group-text" for="search">
                    <FontAwesomeIcon icon={faSearch} fixedWidth />
                </Label>
            </InputGroupAddon>
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
