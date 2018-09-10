import React, {Component} from "react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faSpinnerThird} from "@fortawesome/pro-solid-svg-icons"

const LONG_LOADING_THRESHOLD = 5 // sekundy

export default class Loading extends Component {
    constructor(props) {
        super(props)
        this.state = {
            LONG_LOADING: false
        }
        this.timeoutId = setTimeout(() => this.setState({LONG_LOADING: true}), LONG_LOADING_THRESHOLD * 1000)
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId)
    }

    render() {
        return (
            <div className="text-center">
                <FontAwesomeIcon icon={faSpinnerThird} spin size="3x"/>
                <br/>
                {this.props.text ? this.props.text : "Načítání"}...
                {this.state.LONG_LOADING && " Stále pracuji 😏"}
            </div>
        )
    }
}
