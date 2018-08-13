import React from "react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faSpinnerThird} from "@fortawesome/pro-solid-svg-icons"

const Loading = ({text = "Načítání"}) =>
    <div className="text-center">
        <FontAwesomeIcon icon={faSpinnerThird} spin size="3x"/>
        <br/>
        {text}...
    </div>

export default Loading
