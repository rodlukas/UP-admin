import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Alert } from "@mantine/core"
import { faSpinnerThird, faSyncAlt } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import CustomButton from "./buttons/CustomButton"
import * as styles from "./Loading.css"

const LONG_LOADING_THRESHOLD = 5 // sekundy
const OVERLONG_LOADING_THRESHOLD = 25 // sekundy

enum LOADING_STATE {
    /** Načítání probíhá krátce. */
    NORMAL_LOADING = 0,
    /** Načítání probíhá delší dobu. */
    LONG_LOADING = 1,
    /** Načítání probíhá příliš dlouho, to značí problém, zobraz možné řešení. */
    OVERLONG_LOADING = 2,
}

type Props = {
    /** Text zobrazený při načítání. */
    text?: string
}

/** Komponenta zobrazující načítání v aplikaci. */
const Loading: React.FC<Props> = ({ text = "Načítání" }) => {
    const [loadingState, setLoadingState] = React.useState(LOADING_STATE.NORMAL_LOADING)

    function setLoadingTimeout(newLoadingState: LOADING_STATE): ReturnType<typeof setTimeout> {
        return globalThis.setTimeout(
            () => setLoadingState(newLoadingState),
            (newLoadingState === LOADING_STATE.LONG_LOADING
                ? LONG_LOADING_THRESHOLD
                : OVERLONG_LOADING_THRESHOLD) * 1000,
        )
    }

    React.useEffect(() => {
        const timeoutId = setLoadingTimeout(LOADING_STATE.LONG_LOADING)
        return (): void => globalThis.clearTimeout(timeoutId)
    }, [])

    React.useEffect(() => {
        const timeoutId = setLoadingTimeout(LOADING_STATE.OVERLONG_LOADING)
        return (): void => globalThis.clearTimeout(timeoutId)
    }, [])

    return (
        <div
            className={styles.wrapper}
            data-qa="loading"
            role="status"
            aria-live="polite"
            aria-busy="true">
            <FontAwesomeIcon
                icon={faSpinnerThird}
                spin
                size="3x"
                className={styles.spinner}
                aria-hidden
            />
            <p className={styles.text}>
                {text}…
                {loadingState === LOADING_STATE.LONG_LOADING && (
                    <span className={styles.longHint}>Stále pracuji</span>
                )}
            </p>
            {loadingState === LOADING_STATE.OVERLONG_LOADING && (
                <Alert color="yellow" className={styles.overlongAlert}>
                    <p>
                        ⚠ Načítání trvá příliš dlouho, mohlo dojít k chybě. Zkuste stránku načíst
                        znovu.
                    </p>
                    <CustomButton
                        content={
                            <>
                                <FontAwesomeIcon icon={faSyncAlt} transform="left-2" /> Načíst
                                stránku znovu
                            </>
                        }
                        onClick={(): void => {
                            globalThis.location?.reload()
                        }}
                    />
                </Alert>
            )}
        </div>
    )
}

export default Loading
