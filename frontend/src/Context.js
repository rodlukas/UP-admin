import React, {Component, createContext} from "react"
import AttendanceStateService from "./api/services/attendancestate"

const {Provider, Consumer} = createContext({
    attendancestates:
        {
            data: [],
            funcRefresh: () => {}
        }
})

export class MyProvider extends Component {
    state = {
        attendancestates: []
    }

    componentDidMount() {
        this.getAttendanceStates()
    }

    getAttendanceStates = () => {
        AttendanceStateService.getAll()
            .then(attendancestates => this.setState({attendancestates}))
    }

    render = () =>
        <Provider
            value={{
                attendancestates:
                    {
                        data: this.state.attendancestates,
                        funcRefresh: this.getAttendanceStates
                    }
            }}>
            {this.props.children}
        </Provider>
}

const WithContext = (Component) => {
    return (props) => (
        <Consumer>
            {context => <Component {...props} context={context}/>}
        </Consumer>
    )
}

export {Consumer, WithContext}
