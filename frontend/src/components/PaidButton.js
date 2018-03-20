import React, {Component} from "react"
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import {faUsdCircle} from "@fortawesome/fontawesome-pro-solid"
import "./PaidButton.css"
import AuthService from "../Auth/AuthService"
import axios from "axios"
import {API_URL, NOTIFY_LEVEL, NOTIFY_TEXT} from "../global/GlobalConstants"

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
        const data = {paid: newState}
        axios.patch(API_URL + 'attendances/' + this.state.attendanceId + '/', data, AuthService.getHeaders())
            .then(() => {
                this.props.funcRefresh()
                this.setState({paid: newState})
                this.props.notify(NOTIFY_TEXT.SUCCESS, NOTIFY_LEVEL.SUCCESS)
            })
            .catch((error) => {
                console.log(error)
                this.props.notify(NOTIFY_TEXT.ERROR, NOTIFY_LEVEL.ERROR)
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
