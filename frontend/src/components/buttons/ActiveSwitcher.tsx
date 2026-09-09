import { SegmentedControl } from "@mantine/core"
import * as React from "react"

import { AnalyticsSource, trackEvent } from "../../analytics"

import * as styles from "./ActiveSwitcher.css"
import * as segmented from "./segmented.css"

type Props = {
    /** Je vybráno zobrazení aktivních klientů/skupin (true). */
    active: boolean
    /** Funkce, která se zavolá při přepínání. */
    onChange: (active: boolean) => void
    /** Identifikace místa, odkud byla akce provedena (pro analytiku). */
    source: AnalyticsSource
}

const ACTIVE_VALUE = "active"
const INACTIVE_VALUE = "inactive"

/**
 * Přepínač ne/aktivních skupin/klientů.
 *
 * `SegmentedControl` místo dvojice tlačítek: je to jeden ovládací prvek s jednou
 * vybranou hodnotou, což Mantine vykreslí jako radiogroup — ovládání klávesnicí
 * a stav pro čtečky tedy nemusíme psát sami.
 */
const ActiveSwitcher: React.FC<Props> = (props) => {
    const onSwitcherChange = (value: string): void => {
        const active = value === ACTIVE_VALUE
        if (props.active !== active) {
            trackEvent("active_filter_toggled", { source: props.source, active })
            props.onChange(active)
        }
    }

    return (
        <SegmentedControl
            value={props.active ? ACTIVE_VALUE : INACTIVE_VALUE}
            onChange={onSwitcherChange}
            // data-qa musi zustat na klikatelnem prvku uvnitr popisku — E2E kroky
            // (helpers.toggle_switcher_active) se chytaji prave jich
            data={[
                {
                    value: ACTIVE_VALUE,
                    label: <span data-qa="button_switcher_active">Aktivní</span>,
                },
                {
                    value: INACTIVE_VALUE,
                    label: <span data-qa="button_switcher_inactive">Neaktivní</span>,
                },
            ]}
            classNames={{
                root: `${segmented.segmentedRoot} ${styles.activeSwitcher}`,
                indicator: segmented.segmentedIndicator,
                label: segmented.segmentedLabel,
            }}
        />
    )
}

export default ActiveSwitcher
