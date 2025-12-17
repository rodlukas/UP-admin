import * as React from "react"

import { useAttendanceStates } from "../api/hooks"
import { useContextWithProvider } from "../hooks/useContextWithProvider"
import { AttendanceStateType } from "../types/models"

type Context = {
    /** Probíhá první načítání dat (true) - data ještě nejsou načtená. */
    isLoading: boolean
    /** Probíhá načítání dat na pozadí (true). */
    isFetching: boolean
    /** Pole se stavy účastí. */
    attendancestates: AttendanceStateType[]
}

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

export const useAttendanceStatesContext = (): Context =>
    useContextWithProvider(AttendanceStatesContext)

export { AttendanceStatesContext }
