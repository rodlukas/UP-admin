import {faCommentAltDollar} from "@fortawesome/pro-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import React from "react"

const RemindPay = ({remind_pay}) =>
    remind_pay &&
    <FontAwesomeIcon icon={faCommentAltDollar} size="lg" className="text-secondary" transform="up-4" title="Příště platit"/>

export default RemindPay
