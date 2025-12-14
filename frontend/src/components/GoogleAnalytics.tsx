import * as React from "react"
import * as ReactGA from "react-ga"
import { Route, RouteComponentProps } from "react-router-dom"

import { isEnvProduction } from "../global/funcEnvironments"

type Props = RouteComponentProps & { options: ReactGA.FieldsObject }

/**
 * Komponenta zajišťující Google Analytics napříč aplikací.
 *
 * Vychází z: https://vanja.gavric.org/blog/integrate-google-analytics-with-react-router-v4/ a
 * https://github.com/react-ga/react-ga/wiki/React-Router-v4-withTracker
 */
const GoogleAnalytics: React.FC<Props> = (props) => {
    const logPageChange = React.useCallback(
        (page: string): void => {
            const { location } = window
            ReactGA.set({
                page,
                location: `${location.origin}${page}`,
                ...props.options,
            })
            ReactGA.pageview(page)
        },
        [props.options],
    )

    React.useEffect(() => {
        const page = props.location.pathname + props.location.search
        logPageChange(page)
    }, [props.location.pathname, props.location.search, logPageChange])

    const prevLocationRef = React.useRef(props.location)
    React.useEffect(() => {
        const currentPage = prevLocationRef.current.pathname + prevLocationRef.current.search
        const nextPage = props.location.pathname + props.location.search

        if (currentPage !== nextPage) {
            logPageChange(nextPage)
            prevLocationRef.current = props.location
        }
    }, [props.location, logPageChange])

    return null
}

const RouteTracker = (): React.ReactElement => <Route component={GoogleAnalytics} />

const init = (options: ReactGA.FieldsObject = {}): boolean => {
    const isProduction = isEnvProduction()
    if (isProduction) {
        ReactGA.initialize("UA-53235943-3", {
            gaOptions: {
                siteSpeedSampleRate: 100,
            },
            ...options,
        })
    }
    return isProduction
}

export default {
    GoogleAnalytics,
    RouteTracker,
    init,
}
