import React, {Component} from "react"
import "./PaidButton.css"
import {Input} from 'reactstrap'
import AttendanceService from "../api/services/attendance"

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
        const id = this.state.attendanceId
        const data = {id, attendancestate_id: newValue}
        AttendanceService.patch(data)
            .then(() => {
                this.props.funcRefresh()
                this.setState({value: newValue})
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
