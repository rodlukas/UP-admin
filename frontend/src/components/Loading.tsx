import { faSpinnerThird } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as React from "react"

const LONG_LOADING_THRESHOLD = 5 // sekundy

type Props = {
    text?: string
}

/** Komponenta zobrazující načítání v aplikaci. */
const Loading: React.FunctionComponent<Props> = ({ text = "Načítání" }) => {
    const [longLoading, setLongLoading] = React.useState(false)

    React.useEffect(() => {
        const timeoutId = window.setTimeout(
            () => setLongLoading(true),
            LONG_LOADING_THRESHOLD * 1000
        )

        return (): void => window.clearTimeout(timeoutId)
    }, [])

    return (
        <div className="text-center mt-2" data-qa="loading">
            <FontAwesomeIcon icon={faSpinnerThird} spin size="3x" />
            <br />
            {text}...
            {longLoading && " Stále pracuji 😎"}
        </div>
    )
}

export default Loading
