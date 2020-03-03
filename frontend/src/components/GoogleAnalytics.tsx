import * as React from "react"
import * as ReactGA from "react-ga"
import { FieldsObject } from "react-ga"
import { Route, RouteComponentProps } from "react-router-dom"
import { isEnvProduction } from "../global/funcEnvironments"

type Props = RouteComponentProps & FieldsObject

// vychazi z: https://vanja.gavric.org/blog/integrate-google-analytics-with-react-router-v4/ a
// https://github.com/react-ga/react-ga/wiki/React-Router-v4-withTracker

class GoogleAnalytics extends React.Component<Props> {
    componentDidMount(): void {
        const page = this.props.location.pathname + this.props.location.search
        this.logPageChange(page)
    }

    componentDidUpdate(prevProps: Props): void {
        const currentPage = prevProps.location.pathname + prevProps.location.search
        const nextPage = this.props.location.pathname + this.props.location.search

        if (currentPage !== nextPage) {
            this.logPageChange(nextPage)
        }
    }

    logPageChange(page: string): void {
        const { location } = window
        ReactGA.set({
            page,
            location: `${location.origin}${page}`,
            ...this.props.options
        })
        ReactGA.pageview(page)
    }

    render(): React.ReactNode {
        return null
    }
}

const RouteTracker = (): React.ReactElement => <Route component={GoogleAnalytics} />

const init = (options: FieldsObject = {}): boolean => {
    const isProduction = isEnvProduction()
    if (isProduction) {
        ReactGA.initialize("UA-53235943-3", {
            gaOptions: {
                siteSpeedSampleRate: 100
            },
            ...options
        })
    }
    return isProduction
}

export default {
    GoogleAnalytics,
    RouteTracker,
    init
}
