import React, {Component, createContext} from "react"
import AttendanceStateService from "../api/services/attendancestate"

const AttendanceStatesContext = createContext({
    attendancestates: [],
    funcRefresh: () => {},
    isLoaded: false
})

export class AttendanceStatesProvider extends Component {
    state = {
        isLoaded: false,
        attendancestates: []
    }

    componentDidMount() {
        this.getAttendanceStates(() => this.setState({isLoaded: true}))
    }

    getAttendanceStates = callback =>
        AttendanceStateService.getAll()
            .then(attendancestates => this.setState({attendancestates}, callback))

    render = () =>
        <AttendanceStatesContext.Provider
            value={{
                attendancestates: this.state.attendancestates,
                funcRefresh: this.getAttendanceStates,
                isLoaded: this.state.isLoaded
            }}>
            {this.props.children}
        </AttendanceStatesContext.Provider>
}

const WithAttendanceStatesContext = WrappedComponent => props =>
    <AttendanceStatesContext.Consumer>
        {attendanceStatesContext => <WrappedComponent {...props} attendanceStatesContext={attendanceStatesContext}/>}
    </AttendanceStatesContext.Consumer>


export {WithAttendanceStatesContext, AttendanceStatesContext}
