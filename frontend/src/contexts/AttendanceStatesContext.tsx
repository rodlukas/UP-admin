import * as React from "react"
import AttendanceStateService from "../api/services/attendancestate"
import { noop } from "../global/utils"
import { AttendanceStateType } from "../types/models"
import { fFunction } from "../types/types"

interface StateContext {
    isLoaded: boolean
    attendancestates: Array<AttendanceStateType>
}

interface Context extends StateContext {
    funcRefresh: (callback?: fFunction) => void
}

/** Context pro přístup a práci se stavy účasti. */
const AttendanceStatesContext = React.createContext<Context>({
    attendancestates: [],
    funcRefresh: noop,
    isLoaded: false
})

export class AttendanceStatesProvider extends React.Component<{}, StateContext> {
    state: StateContext = {
        isLoaded: false,
        attendancestates: []
    }

    componentDidMount(): void {
        this.getAttendanceStates()
    }

    getAttendanceStates = (callback = noop): void =>
        this.setState({ isLoaded: false }, () => {
            AttendanceStateService.getAll().then(attendancestates =>
                this.setState(
                    {
                        attendancestates,
                        isLoaded: true
                    },
                    callback
                )
            )
        })

    render = (): React.ReactNode => (
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

export type AttendanceStatesContextProps = {
    attendanceStatesContext: Context
}

const WithAttendanceStatesContext = <P,>(
    WrappedComponent: React.ComponentType<P>
): React.ComponentType<Omit<P, keyof AttendanceStatesContextProps>> => (
    props
): React.ReactElement => (
    <AttendanceStatesContext.Consumer>
        {(attendanceStatesContext): React.ReactNode => (
            <WrappedComponent {...(props as P)} attendanceStatesContext={attendanceStatesContext} />
        )}
    </AttendanceStatesContext.Consumer>
)

export { WithAttendanceStatesContext, AttendanceStatesContext }
