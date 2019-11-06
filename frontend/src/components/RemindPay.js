import { faCommentAltDollar } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { Fragment } from "react"
import { UncontrolledTooltip } from "reactstrap"

const RemindPay = ({ attendance }) =>
    attendance.remind_pay && (
        <Fragment>
            <FontAwesomeIcon
                icon={faCommentAltDollar}
                size="lg"
                className="text-secondary"
                transform="up-4"
                id={"RemindPay" + attendance.id}
            />
            <UncontrolledTooltip placement="right" target={"RemindPay" + attendance.id}>
                Příště platit
            </UncontrolledTooltip>
        </Fragment>
    )

export default RemindPay
