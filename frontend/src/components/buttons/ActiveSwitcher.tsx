import * as React from "react"
import { Button, ButtonGroup } from "reactstrap"

import { AnalyticsSource, trackEvent } from "../../analytics"

import * as styles from "./ActiveSwitcher.css"

type Props = {
    /** Je vybráno zobrazení aktivních klientů/skupin (true). */
    active: boolean
    /** Funkce, která se zavolá při přepínání. */
    onChange: (active: boolean, ignoreActiveRefresh: boolean) => void
    /** Identifikace místa, odkud byla akce provedena (pro analytiku). */
    source: AnalyticsSource
}

/** Přepínač ne/aktivních skupin/klientů. */
const ActiveSwitcher: React.FC<Props> = (props) => {
    function onSwitcherChange(e: React.MouseEvent<HTMLButtonElement>): void {
        const target = e.currentTarget
        const value = target.dataset.value === "true"
        // pokud doslo ke zmene, propaguj vyse
        if (props.active !== value) {
            trackEvent("active_filter_toggled", { source: props.source, active: value })
            props.onChange(value, true)
        }
    }

    return (
        <ButtonGroup className={styles.activeSwitcher}>
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
