import React, {Component} from "react"
import {Button, ButtonGroup} from "reactstrap"
import "./buttons.css"
import "./ActiveSwitcher.css"


export default class ActiveSwitcher extends Component {

    onSwitcherChange = e => {
        const target = e.target
        const value = target.dataset.value === 'true'
        // pokud doslo ke zmene, propaguj vyse
        if (this.props.active !== value)
            this.props.onChange(value)
    }

    render() {
        return (
            <ButtonGroup className="ActiveSwitcher">
                <Button color="secondary" data-value={true} onClick={this.onSwitcherChange}
                        active={this.props.active} data-qa="button_switcher_active">
                    Aktivní
                </Button>
                <Button color="secondary" data-value={false} onClick={this.onSwitcherChange}
                        active={!this.props.active} data-qa="button_switcher_inactive">
                    Neaktivní
                </Button>
            </ButtonGroup>
        )
    }
}
