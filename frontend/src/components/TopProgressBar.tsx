import { useIsFetching } from "@tanstack/react-query"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import classNames from "classnames"
import * as React from "react"

import * as styles from "./TopProgressBar.css"

/** Nikdy nedosáhne 100 % samo od sebe — dokud fetch neskončí, musí to vypadat, že furt něco běží. */
const CAP_PROGRESS = 90
/** Skok hned na startu, aby bylo vidět, že se něco děje, i kdyby fetch skončil okamžitě. */
const START_PROGRESS = 15
/** Jak často se pruh při čekání posune blíž ke stropu (`CAP_PROGRESS`). */
const TRICKLE_INTERVAL_MS = 200
/** Podíl zbývající vzdálenosti ke stropu, o který se pruh při každém tiku přiblíží. */
const TRICKLE_STEP = 0.2
/** Musí odpovídat CSS přechodům v TopProgressBar.css.ts (doplnění šířky, pak fade). */
const COMPLETE_ANIMATION_MS = 500

/**
 * Globální indikátor dotahování dat (libovolný dotaz React Query, kdekoliv v appce) —
 * tenký pruh nahoře přes celou šířku okna, ve stylu YouTube/GitHub: plní se zleva a na
 * konci doskočí na 100 % a odfadeuje, místo aby jen zmizel uprostřed animace. Nahrazuje
 * dřívější tečky u nadpisu stránky: ty byly vázané na konkrétní `isFetching` jedné
 * stránky a jejich mount/unmount uvnitř `Title` měnil výšku nadpisu (Mantine `Loader`
 * typu "dots" je `display: flex`, tedy blokový box) — objevení/zmizení posunulo celý
 * obsah stránky pod ním. Tenhle pruh je `position: fixed`, mimo tok dokumentu, takže
 * k tomu dojít nemůže.
 *
 * `data-qa="global-loading"` je vlastní atribut, ne `data-qa="loading"` — ten kontrakt
 * (`wait_loading_cycle`/`wait_loading_ends` v tests/ui_steps/helpers.py) drží per-stránková
 * kostra (`SkeletonShell`, viz Skeletons.tsx) a čeká na objevení/zmizení libovolného elementu
 * s tímto atributem. Sdílet ho by ten kontrakt rozbilo: `TopProgressBar` reaguje na
 * `useIsFetching()` přes celou appku, takže by kroky čekající na doběhnutí jedné tabulky
 * začaly navíc čekat i na nesouvisející dotazy běžící na pozadí jinde.
 */
const TopProgressBar: React.FC = () => {
    const isFetching = useIsFetching() > 0
    const [isVisible, setIsVisible] = React.useState(false)
    const [isDone, setIsDone] = React.useState(false)
    const [progress, setProgress] = React.useState(START_PROGRESS)
    // true po dobu, co pruh dobíhá na 100 % a čeká na `COMPLETE_ANIMATION_MS` před odmountem
    const isCompletingRef = React.useRef(false)

    React.useEffect(() => {
        if (isFetching) {
            setIsVisible(true)
            // Další dotaz odstartoval dřív, než doběhla dokončovací animace toho
            // předchozího (pruh byl na 100 % a mizel) - skok zpátky na `START_PROGRESS` by
            // ho na okamžik nechal animovat pozpátku (šířka i barva by se 200ms/300ms
            // přechodem vracely dolů/zpátky do plné neprůhlednosti). Místo toho se nechá
            // plný a neprůhledný — jen se zruší mizení — a trickle interval ho odtud
            // pozvolna sveze zpátky ke stropu (`CAP_PROGRESS`), stejným vzorcem jako by
            // sjížděl odspoda, takže žádný skok není vidět.
            if (isCompletingRef.current) {
                isCompletingRef.current = false
                setIsDone(false)
            } else {
                setIsDone(false)
                setProgress(START_PROGRESS)
            }
            const intervalId = globalThis.setInterval(() => {
                setProgress((current) => current + (CAP_PROGRESS - current) * TRICKLE_STEP)
            }, TRICKLE_INTERVAL_MS)
            return (): void => globalThis.clearInterval(intervalId)
        }

        // fetch skončil (nebo žádný neběžel) - doskoč na 100 % a teprve po dobehnutí CSS
        // přechodu (šířka, pak fade - viz TopProgressBar.css.ts) odmountuj
        setProgress(100)
        setIsDone(true)
        isCompletingRef.current = true
        const hideTimeoutId = globalThis.setTimeout(() => {
            isCompletingRef.current = false
            setIsVisible(false)
        }, COMPLETE_ANIMATION_MS)
        return (): void => globalThis.clearTimeout(hideTimeoutId)
    }, [isFetching])

    if (!isVisible) {
        return null
    }

    return (
        <div className={styles.track} data-qa="global-loading" aria-hidden="true">
            <div
                className={classNames(styles.bar, { [styles.barDone]: isDone })}
                style={assignInlineVars({ [styles.progressVar]: `${progress}%` })}
                data-qa="loading-bar"
            />
        </div>
    )
}

export default TopProgressBar
