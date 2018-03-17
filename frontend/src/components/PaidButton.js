import React, {Component} from "react"
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import {faUsdCircle} from "@fortawesome/fontawesome-pro-solid"
import "./PaidButton.css"
import AuthService from "../Auth/AuthService"
import axios from "axios/index"
import {API_URL} from "./GlobalConstants"

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
                console.log("uspesne zmenen stav platby")
            })
            .catch((error) => {
                console.log(error)
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
