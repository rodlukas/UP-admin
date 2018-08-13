import {PureComponent} from "react"
import AuthService from "./authService"

// interval pro dotazovani na platnost tokenu (pripadne se obnovi jeho platnost)
const REFRESH_TOKEN_INTERVAL = 210 * 60 * 1000 // milisekundy -> 3.5 hodiny (210*60*1000)

export default class AuthChecking extends PureComponent {
    componentDidMount() {
        this.intervalId = setInterval(AuthService.isAuthenticated, REFRESH_TOKEN_INTERVAL)
    }

    componentWillUnmount() {
        clearInterval(this.intervalId)
    }

    render = () => null
}
