import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Table, UnstyledButton } from "@mantine/core"
import { faSort, faSortDown, faSortUp } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import { SortDirection } from "../hooks/useDataTable"

import * as styles from "./SortableTh.css"

type Props = {
    /** Klíč sloupce (shodný s definicí v `useDataTable`). */
    sortKey: string
    /** Právě řazený sloupec. */
    activeKey: string
    /** Směr řazení právě řazeného sloupce. */
    direction: SortDirection
    /** Přepnutí řazení na tento sloupec. */
    onSort: (key: string) => void
    /** Dodatečná CSS třída buňky (např. skrytí sloupce na úzkých oknech). */
    className?: string
    children: React.ReactNode
}

/**
 * Hlavička řaditelného sloupce.
 *
 * Stav řazení nese `aria-sort` na buňce, ne jen ikona — jinak čtečka neřekne, podle
 * čeho je tabulka seřazená. Ikona je vždy přítomná (u neaktivního sloupce tlumená),
 * aby bylo poznat, že se sloupcem jde řadit, i bez přejezdu myší.
 */
const SortableTh: React.FC<Props> = ({
    sortKey,
    activeKey,
    direction,
    onSort,
    className,
    children,
}) => {
    const isActive = activeKey === sortKey
    const icon = !isActive ? faSort : direction === "asc" ? faSortUp : faSortDown
    return (
        <Table.Th
            aria-sort={isActive ? (direction === "asc" ? "ascending" : "descending") : "none"}
            className={className}>
            <UnstyledButton onClick={() => onSort(sortKey)} className={styles.button}>
                {children}
                <FontAwesomeIcon
                    icon={icon}
                    className={isActive ? styles.iconActive : styles.icon}
                    aria-hidden
                />
            </UnstyledButton>
        </Table.Th>
    )
}

export default SortableTh
