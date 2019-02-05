import registerServiceWorker from './registerServiceWorker'
import React from "react"
import {render} from "react-dom"
import Main from "./Main"
import "bootstrap/dist/css/bootstrap.min.css"
import "./index.css"
import {AuthProvider} from "./auth/AuthContext"
import * as Sentry from '@sentry/browser'

Sentry.init({
    dsn: 'https://45ed918ced1d4453914265b6bb4f98ab@sentry.io/1247206',
})

const App = () =>
    <AuthProvider>
        <Main/>
    </AuthProvider>

render(<App/>, document.getElementById("root"))
registerServiceWorker()
