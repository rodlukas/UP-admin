import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"
import { Input, InputGroup, InputGroupText, Label } from "reactstrap"

import * as styles from "./SearchInput.css"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = {
    /** Funkce, která se zavolá při úpravě vyhledávaného výrazu. */
    onSearchChange: (newSearchVal: string) => void
    /** Hledaný výraz. */
    searchVal: string
}

/** Komponenta zobrazující pole pro vyhledávání. */
const SearchInput: React.FC<Props> = (props) => {
    function onSearchChange(e: React.ChangeEvent<HTMLInputElement>): void {
        props.onSearchChange(e.currentTarget.value)
    }

    return (
        <InputGroup className={styles.search}>
            <InputGroupText id="search-icon-wrapper" className={styles.iconWrapper}>
                <Label className={styles.label} for="search">
                    <FontAwesomeIcon icon={faSearch} fixedWidth />
                </Label>
            </InputGroupText>
            <UncontrolledTooltipWrapper placement="left" target="search-icon-wrapper">
                Hledání klientů
            </UncontrolledTooltipWrapper>
            <Input
                onChange={onSearchChange}
                placeholder="Hledat klienta..."
                value={props.searchVal}
                type="search"
                id="search"
                autoComplete="off"
            />
        </InputGroup>
    )
}

export default SearchInput
