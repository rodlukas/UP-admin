import registerServiceWorker from './registerServiceWorker'
import React from "react"
import ReactDOM from "react-dom"
import Main from "./Main"
import "bootstrap/dist/css/bootstrap.min.css"
import "./index.css"
import "react-select/dist/react-select.css"

ReactDOM.render(
    <Main/>,
    document.getElementById("root")
)
registerServiceWorker()
