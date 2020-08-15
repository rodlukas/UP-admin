import * as React from "react"
import CourseService from "../api/services/CourseService"
import { getDisplayName, noop } from "../global/utils"
import { CourseType } from "../types/models"
import { fEmptyVoid, fFunction } from "../types/types"

type StateContext = {
    /** Data v kontextu jsou načtená (true). */
    isLoaded: boolean
    /** Pole s viditelnými klienty. */
    courses: Array<CourseType>
}

type State = StateContext & {
    /** Načtení dat do kontextu už bylo vyžádáno (true). */
    loadRequested: boolean
}

type Context = StateContext & {
    /** Funkce pro načtení dat do kontextu, pokud ještě o načtení nikdo nepožádal. */
    funcRefresh: (callback?: fFunction) => void
    /** Funkce pro obnovení již načtených dat v kontextu. */
    funcHardRefresh: fEmptyVoid
}

/** Context pro přístup a práci s viditelnými kurzy. */
const CoursesVisibleContext = React.createContext<Context>({
    courses: [],
    funcRefresh: noop,
    funcHardRefresh: noop,
    isLoaded: false,
})

/** Provider kontextu s viditelnými kurzy. */
export class CoursesVisibleProvider extends React.Component<{}, State> {
    state: State = {
        loadRequested: false,
        isLoaded: false,
        courses: [],
    }

    getCourses = (callback = noop): void => {
        // pokud jeste nikdo nepozadal o nacteni kurzu, pozadej a nacti je
        if (!this.state.loadRequested) {
            this.setState({ loadRequested: true }, () => {
                CourseService.getVisible().then((courses) =>
                    this.setState(
                        {
                            courses,
                            isLoaded: true,
                        },
                        callback
                    )
                )
            })
        }
    }

    hardRefreshCourses = (): void => {
        // pokud uz je v pameti nactena stara verze kurzu, obnov je (pokud k nacteni jeste nedoslo, nic nedelej)
        if (this.state.loadRequested) {
            this.setState({ isLoaded: false }, () => {
                CourseService.getVisible().then((courses) =>
                    this.setState({
                        courses,
                        isLoaded: true,
                    })
                )
            })
        }
    }

    render = (): React.ReactNode => (
        <CoursesVisibleContext.Provider
            value={{
                courses: this.state.courses,
                funcRefresh: this.getCourses,
                funcHardRefresh: this.hardRefreshCourses,
                isLoaded: this.state.isLoaded,
            }}>
            {this.props.children}
        </CoursesVisibleContext.Provider>
    )
}

/** Props kontextu s viditelnými kurzy při využití HOC. */
export type CoursesVisibleContextProps = {
    /** Objekt kontextu s viditelnými kurzy. */
    coursesVisibleContext: Context
}

type ComponentWithCoursesVisibleContextProps<P> = Omit<P, keyof CoursesVisibleContextProps>

/** HOC komponenta pro kontext s viditelnými kurzy. */
const WithCoursesVisibleContext = <P,>(
    WrappedComponent: React.ComponentType<P>
): React.ComponentType<ComponentWithCoursesVisibleContextProps<P>> => {
    const ComponentWithCoursesVisibleContext = (
        props: ComponentWithCoursesVisibleContextProps<P>
    ) => (
        <CoursesVisibleContext.Consumer>
            {(coursesVisibleContext): React.ReactNode => (
                <WrappedComponent {...(props as P)} coursesVisibleContext={coursesVisibleContext} />
            )}
        </CoursesVisibleContext.Consumer>
    )
    ComponentWithCoursesVisibleContext.displayName = `WithCoursesVisibleContext(${getDisplayName<P>(
        WrappedComponent
    )})`
    return ComponentWithCoursesVisibleContext
}

export { WithCoursesVisibleContext, CoursesVisibleContext }
