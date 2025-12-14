import { useQueryClient } from "@tanstack/react-query"
import * as React from "react"

import { useVisibleCourses } from "../api/hooks"
import { getDisplayName } from "../global/utils"
import { useContextWithProvider } from "../hooks/useContextWithProvider"
import { CourseType } from "../types/models"
import { fEmptyVoid } from "../types/types"

type StateContext = {
    /** Data v kontextu jsou načtená (true). */
    isLoaded: boolean
    /** Pole s viditelnými klienty. */
    courses: CourseType[]
}

type Context = StateContext & {
    /** Funkce pro obnovení dat v kontextu. */
    funcHardRefresh: fEmptyVoid
}

type CoursesVisibleContextInterface = Context | undefined

/** Context pro přístup a práci s viditelnými kurzy. */
const CoursesVisibleContext = React.createContext<CoursesVisibleContextInterface>(undefined)

/** Provider kontextu s viditelnými kurzy. */
export const CoursesVisibleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: courses = [], isLoading, isFetching } = useVisibleCourses()
    const queryClient = useQueryClient()

    const hardRefreshCourses = React.useCallback(() => {
        void queryClient.invalidateQueries({ queryKey: ["courses", { type: "visible" }] })
    }, [queryClient])

    return (
        <CoursesVisibleContext.Provider
            value={{
                courses,
                funcHardRefresh: hardRefreshCourses,
                isLoaded: !isLoading && !isFetching,
            }}>
            {children}
        </CoursesVisibleContext.Provider>
    )
}

/** Props kontextu s viditelnými kurzy při využití HOC. */
export type CoursesVisibleContextProps = {
    /** Objekt kontextu s viditelnými kurzy. */
    coursesVisibleContext: Context
}

/** Interně je v contextu hodnota nebo undefined, ošetřujeme to přes errory. */
type CoursesVisibleContextPropsInternal = {
    coursesVisibleContext: CoursesVisibleContextInterface
}

type ComponentWithCoursesVisibleContextProps<P> = Omit<P, keyof CoursesVisibleContextPropsInternal>

/** HOC komponenta pro kontext s viditelnými kurzy. */
const WithCoursesVisibleContext = <P,>(
    WrappedComponent: React.ComponentType<P>,
): React.ComponentType<ComponentWithCoursesVisibleContextProps<P>> => {
    const ComponentWithCoursesVisibleContext = (
        props: ComponentWithCoursesVisibleContextProps<P>,
    ) => (
        <CoursesVisibleContext.Consumer>
            {(coursesVisibleContext) => {
                if (coursesVisibleContext === undefined) {
                    throw new Error(
                        "coursesVisibleContext must be used within a CoursesVisibleProvider",
                    )
                }
                return (
                    <WrappedComponent
                        {...(props as P)}
                        coursesVisibleContext={coursesVisibleContext}
                    />
                )
            }}
        </CoursesVisibleContext.Consumer>
    )
    ComponentWithCoursesVisibleContext.displayName = `WithCoursesVisibleContext(${getDisplayName<P>(
        WrappedComponent,
    )})`
    return ComponentWithCoursesVisibleContext
}

export const useCoursesVisibleContext = (): Context => useContextWithProvider(CoursesVisibleContext)

export { WithCoursesVisibleContext, CoursesVisibleContext }
