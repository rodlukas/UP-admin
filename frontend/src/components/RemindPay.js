import { faCommentAltDollar } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { Fragment } from "react"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

const RemindPay = ({ attendance }) =>
    attendance.remind_pay && (
        <Fragment>
            <FontAwesomeIcon
                icon={faCommentAltDollar}
                size="lg"
                className="text-secondary"
                transform="up-4"
                id={"RemindPay_" + attendance.id}
            />
            <UncontrolledTooltipWrapper target={"RemindPay_" + attendance.id}>
                Příště platit
            </UncontrolledTooltipWrapper>
        </Fragment>
    )

export default RemindPay
