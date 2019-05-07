import React from "react"
import {Button, ButtonGroup} from "reactstrap"
import "./buttons.css"
import "./ActiveSwitcher.css"

export default function ActiveSwitcher(props) {

    function onSwitcherChange(e) {
        const target = e.target
        const value = target.dataset.value === 'true'
        // pokud doslo ke zmene, propaguj vyse
        if (props.active !== value)
            props.onChange(value)
    }

    return (
        <ButtonGroup className="ActiveSwitcher">
            <Button color="secondary" data-value={true} onClick={onSwitcherChange}
                    active={props.active} data-qa="button_switcher_active">
                Aktivní
            </Button>
            <Button color="secondary" data-value={false} onClick={onSwitcherChange}
                    active={!props.active} data-qa="button_switcher_inactive">
                Neaktivní
            </Button>
        </ButtonGroup>
    )
}
