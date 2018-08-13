import registerServiceWorker from './registerServiceWorker'
import React from "react"
import {render} from "react-dom"
import Main from "./Main"
import "bootstrap/dist/css/bootstrap.min.css"
import "./index.css"
import {AuthProvider} from "./auth/AuthContext"

const App = () =>
    <AuthProvider>
        <Main/>
    </AuthProvider>

render(<App/>, document.getElementById("root"))
registerServiceWorker()
