import * as React from "react"

import { useVisibleCourses } from "../api/hooks"
import { useContextWithProvider } from "../hooks/useContextWithProvider"
import { CourseType } from "../types/models"

type Context = {
    /** Probíhá první načítání dat (true) - data ještě nejsou načtená. */
    isLoading: boolean
    /** Probíhá načítání dat na pozadí (true). */
    isFetching: boolean
    /** Pole s viditelnými kurzy. */
    courses: CourseType[]
}

type CoursesVisibleContextInterface = Context | undefined

/** Context pro přístup a práci s viditelnými kurzy. */
const CoursesVisibleContext = React.createContext<CoursesVisibleContextInterface>(undefined)

/** Provider kontextu s viditelnými kurzy. */
export const CoursesVisibleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: courses = [], isLoading, isFetching } = useVisibleCourses()

    return (
        <CoursesVisibleContext.Provider
            value={{
                courses,
                isLoading,
                isFetching,
            }}>
            {children}
        </CoursesVisibleContext.Provider>
    )
}

export const useCoursesVisibleContext = (): Context => useContextWithProvider(CoursesVisibleContext)

export { CoursesVisibleContext }
