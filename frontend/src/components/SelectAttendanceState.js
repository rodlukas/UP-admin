import React, {Component} from "react"
import "./PaidButton.css"
import AuthService from "../Auth/AuthService"
import axios from "axios"
import {API_URL, NOTIFY_LEVEL, NOTIFY_TEXT} from "../global/GlobalConstants"
import {Input} from 'reactstrap'

export default class SelectAttendanceState extends Component {
    constructor(props) {
        super(props)
        this.state = {
            attendanceId: props.attendanceId,
            attendancestates: props.attendancestates,
            value: props.value
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            attendanceId: nextProps.attendanceId,
            attendancestates: nextProps.attendancestates,
            value: nextProps.value
        })
    }

    onChange = (e) => {
        const newValue = e.target.value
        const data = {attendancestate_id: newValue}
        axios.patch(API_URL + 'attendances/' + this.state.attendanceId + '/', data, AuthService.getHeaders())
            .then(() => {
                this.props.funcRefresh()
                this.setState({value: newValue})
                this.props.notify(NOTIFY_TEXT.SUCCESS, NOTIFY_LEVEL.SUCCESS)
            })
            .catch((error) => {
                console.log(error)
                this.props.notify(NOTIFY_TEXT.ERROR, NOTIFY_LEVEL.ERROR)
            })
    }

    render() {
        const {value, attendancestates} = this.state
        return (
            <Input type="select" bsSize="sm" onChange={this.onChange} value={value}>
                {attendancestates.map(attendancestate =>
                    (attendancestate.visible || attendancestate.id === value) // ukaz pouze viditelne, pokud ma klient neviditelny, ukaz ho take
                    && <option key={attendancestate.id} value={attendancestate.id}>{attendancestate.name}</option>)}
            </Input>
        )
    }
}
