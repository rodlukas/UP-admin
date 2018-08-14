import React, {Component, createContext} from "react"
import AttendanceStateService from "../api/services/attendancestate"

const AttendanceStatesContext = createContext({
    attendancestates: [],
    funcRefresh: () => {}
})

export class AttendanceStatesProvider extends Component {
    state = {
        attendancestates: []
    }

    componentDidMount() {
        this.getAttendanceStates()
    }

    getAttendanceStates = () =>
        AttendanceStateService.getAll()
            .then(attendancestates => this.setState({attendancestates}))

    render = () =>
        <AttendanceStatesContext.Provider
            value={{
                attendancestates: this.state.attendancestates,
                funcRefresh: this.getAttendanceStates
            }}>
            {this.props.children}
        </AttendanceStatesContext.Provider>
}

const WithAttendanceStatesContext = WrappedComponent => props =>
    <AttendanceStatesContext.Consumer>
        {attendanceStatesContext => <WrappedComponent {...props} attendanceStatesContext={attendanceStatesContext}/>}
    </AttendanceStatesContext.Consumer>

const AttendanceStateConsumer = AttendanceStatesContext.Consumer

export {AttendanceStateConsumer, WithAttendanceStatesContext}
