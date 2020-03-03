import * as React from "react"
import CourseService from "../api/services/course"
import { noop } from "../global/utils"
import { CourseType } from "../types/models"
import { fArgVoid } from "../types/types"

interface StateContext {
    isLoaded: boolean
    courses: Array<CourseType>
}

interface State extends StateContext {
    loadRequested: boolean
}

interface Context extends StateContext {
    funcRefresh: fArgVoid
    funcHardRefresh: fArgVoid
}

/** Context pro přístup a práci s viditelnými kurzy. */
const CoursesVisibleContext = React.createContext<Context>({
    courses: [],
    funcRefresh: noop,
    funcHardRefresh: noop,
    isLoaded: false
})

export class CoursesVisibleProvider extends React.Component<{}, State> {
    state = {
        loadRequested: false,
        isLoaded: false,
        courses: []
    }

    getCourses = (callback = noop): void => {
        // pokud jeste nikdo nepozadal o nacteni kurzu, pozadej a nacti je
        if (!this.state.loadRequested)
            this.setState({ loadRequested: true }, () => {
                CourseService.getVisible().then(courses =>
                    this.setState(
                        {
                            courses,
                            isLoaded: true
                        },
                        callback
                    )
                )
            })
    }

    hardRefreshCourses = (): void => {
        // pokud uz je v pameti nactena stara verze kurzu, obnov je (pokud k nacteni jeste nedoslo, nic nedelej)
        if (this.state.loadRequested)
            this.setState({ isLoaded: false }, () => {
                CourseService.getVisible().then(courses =>
                    this.setState({
                        courses,
                        isLoaded: true
                    })
                )
            })
    }

    render = (): React.ReactNode => (
        <CoursesVisibleContext.Provider
            value={{
                courses: this.state.courses,
                funcRefresh: this.getCourses,
                funcHardRefresh: this.hardRefreshCourses,
                isLoaded: this.state.isLoaded
            }}>
            {this.props.children}
        </CoursesVisibleContext.Provider>
    )
}

export type CoursesVisibleContextProps = {
    coursesVisibleContext: Context
}

const WithCoursesVisibleContext = <P,>(
    WrappedComponent: React.ComponentType<P>
): React.ComponentType<Omit<P, keyof CoursesVisibleContextProps>> => (
    props
): React.ReactElement => (
    <CoursesVisibleContext.Consumer>
        {(coursesVisibleContext): React.ReactNode => (
            <WrappedComponent {...(props as P)} coursesVisibleContext={coursesVisibleContext} />
        )}
    </CoursesVisibleContext.Consumer>
)

export { WithCoursesVisibleContext, CoursesVisibleContext }
