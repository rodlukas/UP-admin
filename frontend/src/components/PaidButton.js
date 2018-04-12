import React, {Component} from "react"
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import {faUsdCircle} from "@fortawesome/fontawesome-pro-solid"
import "./PaidButton.css"
import AttendanceService from "../api/services/attendance"

export default class PaidButton extends Component {
    constructor(props) {
        super(props)
        this.state = {
            attendanceId: props.attendanceId,
            paid: props.paid
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            attendanceId: nextProps.attendanceId,
            paid: nextProps.paid})
    }

    onClick = () => {
        const newState = !this.state.paid
        const id = this.state.attendanceId
        const data = {id, paid: newState}
        AttendanceService.patch(data)
            .then(() => {
                this.props.funcRefresh()
                this.setState({paid: newState})
            })
    }

    render() {
        const {paid} = this.state
        return (
                <FontAwesomeIcon icon={faUsdCircle} size="2x"
                                 className={"PaidButton " + (paid ? "text-success" : "text-danger")}
                                 onClick={this.onClick}/>
        )
    }
}
