import React, { Component, createContext } from "react"
import CourseService from "../api/services/course"

/** Context pro přístup a práci s viditelnými kurzy. */
const CoursesVisibleContext = createContext({
    courses: [],
    funcRefresh: () => {},
    funcHardRefresh: () => {},
    isLoaded: false
})

export class CoursesVisibleProvider extends Component {
    state = {
        loadRequested: false,
        isLoaded: false,
        courses: []
    }

    getCourses = (callback = () => {}) => {
        // pokud jeste nikdo nepozadal o nacteni kurzu, pozadej a nacti je
        if (!this.state.loadRequested)
            this.setState({ loadRequested: true }, () =>
                CourseService.getVisible().then(courses =>
                    this.setState(
                        {
                            courses,
                            isLoaded: true
                        },
                        callback
                    )
                )
            )
    }

    hardRefreshCourses = () => {
        // pokud uz je v pameti nactena stara verze kurzu, obnov je (pokud k nacteni jeste nedoslo, nic nedelej)
        if (this.state.loadRequested)
            this.setState({ isLoaded: false }, () =>
                CourseService.getVisible().then(courses =>
                    this.setState({
                        courses,
                        isLoaded: true
                    })
                )
            )
    }

    render = () => (
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

const WithCoursesVisibleContext = WrappedComponent => props => (
    <CoursesVisibleContext.Consumer>
        {coursesVisibleContext => (
            <WrappedComponent {...props} coursesVisibleContext={coursesVisibleContext} />
        )}
    </CoursesVisibleContext.Consumer>
)

export { WithCoursesVisibleContext, CoursesVisibleContext }
