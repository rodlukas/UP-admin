import * as React from "react"
import { Button, ButtonGroup } from "reactstrap"
import { fArgVoid } from "../../types/types"
import "./ActiveSwitcher.css"
import "./buttons.css"

type Props = {
    active: boolean
    onChange: fArgVoid
}

/** Přepínač ne/aktivních skupin/klientů. */
const ActiveSwitcher: React.FC<Props> = props => {
    function onSwitcherChange(e: React.MouseEvent<HTMLButtonElement>): void {
        const target = e.currentTarget
        const value = target.dataset.value === "true"
        // pokud doslo ke zmene, propaguj vyse
        if (props.active !== value) props.onChange(value, true)
    }

    return (
        <ButtonGroup className="ActiveSwitcher">
            <Button
                color="secondary"
                data-value={true}
                onClick={onSwitcherChange}
                active={props.active}
                data-qa="button_switcher_active">
                Aktivní
            </Button>
            <Button
                color="secondary"
                data-value={false}
                onClick={onSwitcherChange}
                active={!props.active}
                data-qa="button_switcher_inactive">
                Neaktivní
            </Button>
        </ButtonGroup>
    )
}

export default ActiveSwitcher
