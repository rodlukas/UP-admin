import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faExclamationCircle, faInbox } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import * as styles from "./EmptyState.css"

type Props = {
    /** Ikona vystihující, co v seznamu chybí. */
    icon?: typeof faInbox
    /** Krátká věta, co se nenašlo. */
    title: string
    /** Doplnění: proč je prázdno nebo co s tím. */
    description?: React.ReactNode
    /** Hlavní akce — prázdná obrazovka má nabídnout, co dělat dál. */
    action?: React.ReactNode
}

/**
 * Jednotný prázdný stav seznamu.
 *
 * Prázdná obrazovka je místo, kde uživatel neví, co dál, takže musí vysvětlit proč
 * a nabídnout akci — nahá věta typu „Žádné lekce" na to nestačí.
 */
const EmptyState: React.FC<Props> = ({ icon = faInbox, title, description, action }) => (
    <div className={styles.emptyState}>
        <FontAwesomeIcon icon={icon} className={styles.icon} aria-hidden />
        <p className={styles.title}>{title}</p>
        {description && <p className={styles.description}>{description}</p>}
        {action && <div className={styles.action}>{action}</div>}
    </div>
)

/**
 * `EmptyState` pro variantu „nepodařilo se načíst" — prázdné pole, když data NIKDY nedorazila
 * (`hasData === false`, viz kontexty), neznamená totéž jako skutečně prázdný seznam a nesmí
 * to tak vypadat. Schválně ne `isSuccess`: to se překlopí i při selhaném refetchi, který
 * data z cache nechává, a plně načtený seznam by se pak schoval za chybu.
 *
 * Jednotný text/ikona napříč Klienty, Skupinami, Nastavením atd., ať se to při budoucí
 * úpravě znění nemusí hledat a přepisovat na více místech zvlášť.
 */
export const LoadErrorEmptyState: React.FC<{ resource: string }> = ({ resource }) => (
    <EmptyState
        icon={faExclamationCircle}
        title={`${resource} se nepodařilo načíst`}
        description="Zkuste stránku obnovit."
    />
)

export default EmptyState
