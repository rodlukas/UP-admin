import React, {Fragment} from "react"
import {NavLink as RouterNavLink} from "react-router-dom"
import {Nav, NavItem, NavLink, Button} from "reactstrap"
import AuthService from "../auth/authService"
import "./Menu.css"
import APP_URLS from "../urls"
import {AuthConsumer} from "../auth/AuthContext"
import AuthChecking from "../auth/AuthChecking"

const Menu = props => {
    const MyNavLink = otherProps =>
        <NavLink onClick={props.closeNavbar} tag={RouterNavLink} {...otherProps}/>
    return (
        <AuthConsumer>
            {authContext =>
                authContext.IS_AUTH &&
                <Fragment>
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
                    </Nav>
                    <Button color="secondary"
                            onClick={() => AuthService.logout(authContext.logout)}>
                        Odhlásit
                    </Button>
                    <AuthChecking/>
                </Fragment>}
        </AuthConsumer>
    )
}

export default Menu
