import React, {Component} from "react"
import "./PaidButton.css"
import AuthService from "../Auth/AuthService"
import axios from "axios/index"
import {API_URL} from "./GlobalConstants"
import {Input} from 'reactstrap'

export default class SelectAttendanceState extends Component {
    constructor(props) {
        super(props)
        this.attendanceId = props.attendanceId
        this.attendancestates = props.attendancestates
        this.state = {
            value: props.value
        }
    }

    onChange = (e) => {
        const newValue = e.target.value
        const data = {attendancestate_id: newValue}
        axios.patch(API_URL + 'attendances/' + this.attendanceId + '/', data, AuthService.getHeaders())
            .then(() => {
                this.props.funcRefresh()
                this.setState({value: newValue})
                console.log("uspesne zmenen stav ucasti")
            })
            .catch((error) => {
                console.log(error)
            })
    }

    render() {
        const {value} = this.state
        return (
            <Input type="select" bsSize="sm" onChange={this.onChange} value={value}>
                {this.attendancestates.map(attendancestate =>
                    <option key={attendancestate.id} value={attendancestate.id}>{attendancestate.name}</option>)}
            </Input>
        )
    }
}
