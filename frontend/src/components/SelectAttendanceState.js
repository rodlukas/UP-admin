import React, {Component} from "react"
import {CustomInput} from "reactstrap"
import AttendanceService from "../api/services/attendance"
import {Consumer} from "../Context"

export default class SelectAttendanceState extends Component {
    state = {
        value: this.props.value
    }

    onChange = (e) => {
        const newValue = e.target.value
        const id = this.props.attendanceId
        const data = {id, attendancestate_id: newValue}
        AttendanceService.patch(data)
            .then(() => this.props.funcRefresh())
    }

    render() {
        const {value} = this.state
        return (
            <CustomInput type="select" bsSize="sm" onChange={this.onChange} id={"select" + this.props.attendanceId}
                         value={value}>
                <Consumer>
                    {({attendancestates}) =>
                        attendancestates.data.map(attendancestate =>
                        // ukaz pouze viditelne, pokud ma klient neviditelny, ukaz ho take
                        (attendancestate.visible || attendancestate.id === value) &&
                        <option key={attendancestate.id} value={attendancestate.id}>
                            {attendancestate.name}
                        </option>)}
                </Consumer>
            </CustomInput>
        )
    }
}
