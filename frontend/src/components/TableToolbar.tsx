import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { CloseButton, TextInput } from "@mantine/core"
import { faSearch } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import * as styles from "./TableToolbar.css"

type Props = {
    /** Hodnota hledání. */
    query: string
    /** Změna hledání. */
    onQueryChange: (value: string) => void
    /** Co se hledá, v akuzativu — do placeholderu („Hledat klienta"). */
    label: string
    /** V jakých polích se hledá — jen do přístupného názvu, do placeholderu se nevejde. */
    fields: string
    /** Kolik řádků je vidět po odfiltrování. */
    filteredCount: number
    /** Celkový počet řádků bez filtru. */
    totalCount: number
    /** Ovládací prvky vpravo (typicky přepínač aktivní/neaktivní). */
    children?: React.ReactNode
}

/**
 * Lišta nad tabulkou: hledání v rámci seznamu vlevo, filtry vpravo.
 *
 * Hledání tady není totéž co Spotlight (⌘K): Spotlight na záznam **naviguje**, tahle
 * lišta seznam **filtruje** — jinak nejde odpovědět na otázku „kolik mám Nováků".
 */
const TableToolbar: React.FC<Props> = ({
    query,
    onQueryChange,
    label,
    fields,
    filteredCount,
    totalCount,
    children,
}) => (
    <div className={styles.toolbar}>
        <TextInput
            value={query}
            onChange={(event) => onQueryChange(event.currentTarget.value)}
            placeholder={`Hledat ${label}`}
            aria-label={`Hledat ${label} podle: ${fields}`}
            data-qa="table_search"
            // filtrovací pole, ne přihlašovací - správci hesel (Bitwarden, LastPass,
            // 1Password) na něj i tak umí nabídnout autofill, tyhle atributy jim to zakážou
            autoComplete="off"
            data-bwignore
            data-lpignore="true"
            data-1p-ignore
            leftSection={<FontAwesomeIcon icon={faSearch} />}
            rightSection={
                query ? (
                    <CloseButton
                        onClick={() => onQueryChange("")}
                        aria-label="Zrušit hledání"
                        size="sm"
                    />
                ) : null
            }
            className={styles.search}
        />
        <div className={styles.toolbarRight}>
            {query && (
                <output className={styles.count}>
                    {filteredCount} z {totalCount}
                </output>
            )}
            {children}
        </div>
    </div>
)

export default TableToolbar
