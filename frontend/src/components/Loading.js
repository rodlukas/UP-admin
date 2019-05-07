import React, {useState, useEffect} from "react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faSpinnerThird} from "@fortawesome/pro-solid-svg-icons"

const LONG_LOADING_THRESHOLD = 5 // sekundy

const Loading = props => {
    const [longLoading, setLongLoading] = useState(false)

    useEffect(() => {
        const timeoutId = setTimeout(() => setLongLoading(true), LONG_LOADING_THRESHOLD * 1000)

        return () => clearTimeout(timeoutId)
    }, [])

    return (
        <div className="text-center mt-2" data-qa="loading">
            <FontAwesomeIcon icon={faSpinnerThird} spin size="3x"/>
            <br/>
            {props.text ? props.text : "Načítání"}...
            {longLoading && " Stále pracuji 😎"}
        </div>
    )
}

export default Loading
