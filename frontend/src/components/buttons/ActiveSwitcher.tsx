import { Button } from "@mantine/core"
import * as React from "react"

import { AnalyticsSource, trackEvent } from "../../analytics"

import * as styles from "./ActiveSwitcher.css"

type Props = {
    /** Je vybráno zobrazení aktivních klientů/skupin (true). */
    active: boolean
    /** Funkce, která se zavolá při přepínání. */
    onChange: (active: boolean) => void
    /** Identifikace místa, odkud byla akce provedena (pro analytiku). */
    source: AnalyticsSource
}

/** Přepínač ne/aktivních skupin/klientů. */
const ActiveSwitcher: React.FC<Props> = (props) => {
    const inactive = props.active === false

    function onSwitcherChange(e: React.MouseEvent<HTMLButtonElement>): void {
        const target = e.currentTarget
        const value = target.dataset.value === "true"
        // pokud doslo ke zmene, propaguj vyse
        if (props.active !== value) {
            trackEvent("active_filter_toggled", { source: props.source, active: value })
            props.onChange(value)
        }
    }

    return (
        <Button.Group className={styles.activeSwitcher}>
            <Button
                variant={props.active ? "filled" : "default"}
                data-value={true}
                onClick={onSwitcherChange}
                data-qa="button_switcher_active">
                Aktivní
            </Button>
            <Button
                variant={inactive ? "filled" : "default"}
                data-value={false}
                onClick={onSwitcherChange}
                data-qa="button_switcher_inactive">
                Neaktivní
            </Button>
        </Button.Group>
    )
}

export default ActiveSwitcher
