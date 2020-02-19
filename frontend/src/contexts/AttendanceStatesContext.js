import React, { Component, createContext } from "react"
import AttendanceStateService from "../api/services/attendancestate"

/** Context pro přístup a práci se stavy účasti. */
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
        this.getAttendanceStates()
    }

    getAttendanceStates = (callback = () => {}) =>
        this.setState({ isLoaded: false }, () =>
            AttendanceStateService.getAll().then(attendancestates =>
                this.setState(
                    {
                        attendancestates,
                        isLoaded: true
                    },
                    callback
                )
            )
        )

    render = () => (
        <AttendanceStatesContext.Provider
            value={{
                attendancestates: this.state.attendancestates,
                funcRefresh: this.getAttendanceStates,
                isLoaded: this.state.isLoaded
            }}>
            {this.props.children}
        </AttendanceStatesContext.Provider>
    )
}

const WithAttendanceStatesContext = WrappedComponent => props => (
    <AttendanceStatesContext.Consumer>
        {attendanceStatesContext => (
            <WrappedComponent {...props} attendanceStatesContext={attendanceStatesContext} />
        )}
    </AttendanceStatesContext.Consumer>
)

export { WithAttendanceStatesContext, AttendanceStatesContext }
