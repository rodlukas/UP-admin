import React from 'react'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import {faSpinnerThird} from "@fortawesome/fontawesome-pro-solid"

const Loading = () => (
    <div className="text-center">
        <FontAwesomeIcon icon={faSpinnerThird} spin size="3x"/>
        <br/>Načítání...
    </div>
)

export default Loading
