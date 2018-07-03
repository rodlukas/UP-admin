import React from "react"
import {NavLink as RouterNavLink, withRouter} from "react-router-dom"
import {Nav, NavItem, NavLink, Button} from "reactstrap"
import AuthService from "../auth/authService"
import "./Menu.css"
import APP_URLS from "../urls"

const Menu = withRouter(
    ({history}) =>
        AuthService.isAuthenticated(true) &&
        <Nav className="ml-auto" navbar>
            <NavItem>
                <NavLink tag={RouterNavLink} exact activeClassName="active" to={APP_URLS.prehled}>Přehled</NavLink>
            </NavItem>
            <NavItem>
                <NavLink tag={RouterNavLink} to={APP_URLS.diar}>Diář</NavLink>
            </NavItem>
            <NavItem>
                <NavLink tag={RouterNavLink} to={APP_URLS.klienti}>Klienti</NavLink>
            </NavItem>
            <NavItem>
                <NavLink tag={RouterNavLink} to={APP_URLS.skupiny}>Skupiny</NavLink>
            </NavItem>
            <NavItem>
                <NavLink tag={RouterNavLink} to={APP_URLS.zajemci}>Zájemci</NavLink>
            </NavItem>
            <NavItem>
                <NavLink tag={RouterNavLink} to={APP_URLS.nastaveni}>Nastavení</NavLink>
            </NavItem>
            <Button color="secondary" onClick={() => AuthService.signout(() => history.push(APP_URLS.prehled))}>Odhlásit</Button>
        </Nav>
)

export default Menu
