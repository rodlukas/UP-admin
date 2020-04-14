import * as React from "react"
import AttendanceStateService from "../api/services/AttendanceStateService"
import { noop } from "../global/utils"
import { AttendanceStateType } from "../types/models"
import { fFunction } from "../types/types"

type StateContext = {
    /** Data v kontextu jsou načtená (true). */
    isLoaded: boolean
    /** Pole se stavy účastí. */
    attendancestates: Array<AttendanceStateType>
}

type Context = StateContext & {
    /** Funkce pro načtení/obnovení dat v kontextu. */
    funcRefresh: (callback?: fFunction) => void
}

/** Context pro přístup a práci se stavy účasti. */
const AttendanceStatesContext = React.createContext<Context>({
    attendancestates: [],
    funcRefresh: noop,
    isLoaded: false,
})

/** Provider kontextu se stavy účastí. */
export class AttendanceStatesProvider extends React.Component<{}, StateContext> {
    state: StateContext = {
        isLoaded: false,
        attendancestates: [],
    }

    componentDidMount(): void {
        this.getAttendanceStates()
    }

    getAttendanceStates = (callback = noop): void =>
        this.setState({ isLoaded: false }, () => {
            AttendanceStateService.getAll().then((attendancestates) =>
                this.setState(
                    {
                        attendancestates,
                        isLoaded: true,
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
                isLoaded: this.state.isLoaded,
            }}>
            {this.props.children}
        </AttendanceStatesContext.Provider>
    )
}

/** Props kontextu se stavy účastí při využití HOC. */
export type AttendanceStatesContextProps = {
    /** Objekt kontextu se stavy účasti. */
    attendanceStatesContext: Context
}

/** HOC komponenta pro kontext se stavy účasti. */
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
