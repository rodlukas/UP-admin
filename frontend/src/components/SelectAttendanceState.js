import React, {Component} from "react"
import {Input} from 'reactstrap'
import AttendanceService from "../api/services/attendance"

export default class SelectAttendanceState extends Component {
    state = {
        value: this.props.value
    }

    /* podminka v teto metode nastane jen tehdy, pokud rodic zmeni props
        -   takovy pripad ale nenastane, protoze se po kazde zmene vytvari nova instance komponenty
        --> tedy tato metoda pouze zajistuje spravnou funkcnost komponenty v pripade, ze by se tak nedelo (nekdy v budoucnu) */
    static getDerivedStateFromProps(props, state) {
        if (props.value !== state.value)
            return {value: props.value}
        return null
    }

    onChange = (e) => {
        const newValue = e.target.value
        const id = this.props.attendanceId
        const data = {id, attendancestate_id: newValue}
        AttendanceService.patch(data)
            .then(() => {
                this.props.funcRefresh()
            })
    }

    render() {
        const {value} = this.state
        return (
            <Input type="select" bsSize="sm" onChange={this.onChange} value={value}>
                {this.props.attendancestates.map(attendancestate =>
                    (attendancestate.visible || attendancestate.id === value)   // ukaz pouze viditelne, pokud ma klient neviditelny, ukaz ho take
                    && <option key={attendancestate.id} value={attendancestate.id}>{attendancestate.name}</option>)}
            </Input>
        )
    }
}
