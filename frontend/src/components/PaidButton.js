import React, {Component} from "react"
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faUsdCircle} from "@fortawesome/pro-solid-svg-icons"
import "./PaidButton.css"
import AttendanceService from "../api/services/attendance"

export default class PaidButton extends Component {
    onClick = () => {
        const newPaid = !this.props.paid
        const id = this.props.attendanceId
        const data = {id, paid: newPaid}
        AttendanceService.patch(data)
            .then(() => {
                this.props.funcRefresh()
            })
    }

    render() {
        return (
                <FontAwesomeIcon icon={faUsdCircle} size="2x"
                                 className={"PaidButton " + (this.props.paid ? "text-success" : "text-danger")}
                                 onClick={this.onClick}/>
        )
    }
}
