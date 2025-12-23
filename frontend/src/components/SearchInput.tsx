import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import classNames from "classnames"
import * as React from "react"
import { Input, InputGroup, InputGroupAddon, Label } from "reactstrap"

import styles from "./SearchInput.module.css"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = {
    /** Funkce, která se zavolá při úpravě vyhledávaného výrazu. */
    onSearchChange: (newSearchVal: string) => void
    /** Vyhledávaný výraz. */
    searchVal: string
}

/** Komponenta zobrazující pole pro vyhledávání. */
const SearchInput: React.FC<Props> = (props) => {
    function onSearchChange(e: React.ChangeEvent<HTMLInputElement>): void {
        props.onSearchChange(e.currentTarget.value)
    }

    return (
        <InputGroup className={styles.search}>
            <InputGroupAddon
                id="search-icon-wrapper"
                addonType="prepend"
                className={styles.iconWrapper}>
                <Label className={classNames(styles.label, "input-group-text")} for="search">
                    <FontAwesomeIcon icon={faSearch} fixedWidth />
                </Label>
            </InputGroupAddon>
            <UncontrolledTooltipWrapper placement="left" target="search-icon-wrapper">
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
