import * as React from "react"

import { useAttendanceStates } from "../api/hooks"
import { getDisplayName } from "../global/utils"
import { useContextWithProvider } from "../hooks/useContextWithProvider"
import { AttendanceStateType } from "../types/models"

type StateContext = {
    /** Probíhá první načítání dat (true) - data ještě nejsou načtená. */
    isLoading: boolean
    /** Probíhá načítání dat na pozadí (true). */
    isFetching: boolean
    /** Pole se stavy účastí. */
    attendancestates: AttendanceStateType[]
}

type Context = StateContext

type AttendanceStatesContextInterface = Context | undefined

/** Context pro přístup a práci se stavy účasti. */
const AttendanceStatesContext = React.createContext<AttendanceStatesContextInterface>(undefined)

/** Provider kontextu se stavy účastí. */
export const AttendanceStatesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: attendancestates = [], isLoading, isFetching } = useAttendanceStates()

    return (
        <AttendanceStatesContext.Provider
            value={{
                attendancestates,
                isLoading,
                isFetching,
            }}>
            {children}
        </AttendanceStatesContext.Provider>
    )
}

/** Props kontextu se stavy účastí při využití HOC. */
export type AttendanceStatesContextProps = {
    /** Objekt kontextu se stavy účasti. */
    attendanceStatesContext: Context
}

/** Interně je v contextu hodnota nebo undefined, ošetřujeme to přes errory. */
type AttendanceStatesContextPropsInternal = {
    attendanceStatesContext: AttendanceStatesContextInterface
}

type ComponentWithAttendanceStatesContextProps<P> = Omit<
    P,
    keyof AttendanceStatesContextPropsInternal
>

/** HOC komponenta pro kontext se stavy účasti. */
const WithAttendanceStatesContext = <P,>(
    WrappedComponent: React.ComponentType<P>,
): React.ComponentType<ComponentWithAttendanceStatesContextProps<P>> => {
    const ComponentWithAttendanceStatesContext = (
        props: ComponentWithAttendanceStatesContextProps<P>,
    ) => (
        <AttendanceStatesContext.Consumer>
            {(attendanceStatesContext) => {
                if (attendanceStatesContext === undefined) {
                    throw new Error(
                        "attendanceStatesContext must be used within a AttendanceStatesProvider",
                    )
                }
                return (
                    <WrappedComponent
                        {...(props as P)}
                        attendanceStatesContext={attendanceStatesContext}
                    />
                )
            }}
        </AttendanceStatesContext.Consumer>
    )
    ComponentWithAttendanceStatesContext.displayName = `WithAttendanceStatesContext(${getDisplayName<P>(
        WrappedComponent,
    )})`
    return ComponentWithAttendanceStatesContext
}

export const useAttendanceStatesContext = (): Context =>
    useContextWithProvider(AttendanceStatesContext)

export { WithAttendanceStatesContext, AttendanceStatesContext }
