import * as React from "react"

import { useVisibleCourses } from "../api/hooks"
import { useContextWithProvider } from "../hooks/useContextWithProvider"
import { type CourseType } from "../types/models"

type Context = {
    /** Probíhá první načítání dat (true) - data ještě nejsou načtená. */
    isLoading: boolean
    /**
     * Data už někdy dorazila ze serveru — i prázdná. `false` znamená „zatím nenačteno"
     * (první načítání, chyba, offline), takže prázdné pole v takovém případě NENÍ prázdný
     * seznam. Na rozdíl od `status === "success"` přežije selhaný refetch: TanStack Query si při něm
     * data z cache nechá, jen překlopí `status` na „error".
     */
    hasData: boolean
    /** Pole s viditelnými kurzy. */
    courses: CourseType[]
}

type CoursesVisibleContextInterface = Context | undefined

/** Context pro přístup a práci s viditelnými kurzy. */
const CoursesVisibleContext = React.createContext<CoursesVisibleContextInterface>(undefined)

/** Provider kontextu s viditelnými kurzy. */
export const CoursesVisibleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data, isLoading } = useVisibleCourses()
    // `useMemo`: bez nej je `data ?? []` pri kazdem renderu NOVE pole, takze memoizace
    // u konzumentu (`data` memo v SelectCourse) nikdy netrefi
    const courses = React.useMemo(() => data ?? [], [data])

    return (
        <CoursesVisibleContext.Provider
            value={{
                courses,
                isLoading,
                hasData: data !== undefined,
            }}>
            {children}
        </CoursesVisibleContext.Provider>
    )
}

export const useCoursesVisibleContext = (): Context => useContextWithProvider(CoursesVisibleContext)

export { CoursesVisibleContext }
