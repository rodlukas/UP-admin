import React from "react"
import {NavLink as RouterNavLink, withRouter} from "react-router-dom"
import {Nav, NavItem, NavLink, Button} from "reactstrap"
import AuthService from "../auth/authService"
import "./Menu.css"
import APP_URLS from "../urls"

const Menu = withRouter(
    ({history, ...props}) =>
    {
        const MyNavLink = (otherProps) =>
            <NavLink onClick={props.closeNavbar} tag={RouterNavLink} {...otherProps}/>
        return (
            AuthService.isAuthenticated(true) &&
            <Nav className="ml-auto" navbar>
                <NavItem>
                    <MyNavLink exact activeClassName="active" to={APP_URLS.prehled}>Přehled</MyNavLink>
                </NavItem>
                <NavItem>
                    <MyNavLink to={APP_URLS.diar}>Diář</MyNavLink>
                </NavItem>
                <NavItem>
                    <MyNavLink to={APP_URLS.klienti}>Klienti</MyNavLink>
                </NavItem>
                <NavItem>
                    <MyNavLink to={APP_URLS.skupiny}>Skupiny</MyNavLink>
                </NavItem>
                <NavItem>
                    <MyNavLink to={APP_URLS.zajemci}>Zájemci</MyNavLink>
                </NavItem>
                <NavItem>
                    <MyNavLink to={APP_URLS.nastaveni}>Nastavení</MyNavLink>
                </NavItem>
                <Button color="secondary" onClick={() => AuthService.signout(() => history.push(APP_URLS.prehled))}>
                    Odhlásit
                </Button>
            </Nav>
        )
    }
)

export default Menu
