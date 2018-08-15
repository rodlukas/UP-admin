import {PureComponent} from "react"
import {WithAuthContext} from "./AuthContext"

// interval pro dotazovani na platnost tokenu (pripadne se obnovi jeho platnost)
const REFRESH_TOKEN_INTERVAL = 210 * 60 * 1000 // milisekundy -> 3.5 hodiny (210*60*1000)

class AuthChecking extends PureComponent {
    componentDidMount() {
        this.intervalId = setInterval(this.props.authContext.isAuthenticated, REFRESH_TOKEN_INTERVAL)
    }

    componentWillUnmount() {
        clearInterval(this.intervalId)
    }

    render = () => null
}

export default WithAuthContext(AuthChecking)
