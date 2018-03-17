import React from "react"
import {NavLink as RouterNavLink, withRouter} from "react-router-dom"
import {Nav, NavItem, NavLink, Button} from 'reactstrap'
import AuthService from "./Auth/AuthService"

const Menu = withRouter(
    ({history}) =>
        AuthService.isAuthenticated(true) &&
        <Nav className="ml-auto" navbar>
            <NavItem>
                <NavLink tag={RouterNavLink} exact activeClassName="active" to="/">Přehled</NavLink>
            </NavItem>
            <NavItem>
                <NavLink tag={RouterNavLink} to="/diar">Diář</NavLink>
            </NavItem>
            <NavItem>
                <NavLink tag={RouterNavLink} to="/klienti">Klienti</NavLink>
            </NavItem>
            <NavItem>
                <NavLink tag={RouterNavLink} to="/skupiny">Skupiny</NavLink>
            </NavItem>
            <Button color="secondary" onClick={() => AuthService.signout(() => history.push("/"))}>Odhlásit</Button>
        </Nav>
)

export default Menu
