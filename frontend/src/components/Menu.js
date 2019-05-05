import React, {Fragment} from "react"
import {NavLink as RouterNavLink} from "react-router-dom"
import {Nav, NavItem, NavLink, Button} from "reactstrap"
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
                            <MyNavLink exact activeClassName="active" to={APP_URLS.prehled.url}>Přehled</MyNavLink>
                        </NavItem>
                        <NavItem>
                            <MyNavLink to={APP_URLS.diar.url}>Diář</MyNavLink>
                        </NavItem>
                        <NavItem>
                            <MyNavLink to={APP_URLS.klienti.url} data-qa="menu_clients">Klienti</MyNavLink>
                        </NavItem>
                        <NavItem>
                            <MyNavLink to={APP_URLS.skupiny.url} data-qa="menu_groups">Skupiny</MyNavLink>
                        </NavItem>
                        <NavItem>
                            <MyNavLink to={APP_URLS.zajemci.url} data-qa="menu_applications">Zájemci</MyNavLink>
                        </NavItem>
                        <NavItem>
                            <MyNavLink to={APP_URLS.nastaveni.url} data-qa="menu_settings">Nastavení</MyNavLink>
                        </NavItem>
                    </Nav>
                    <Button color="secondary"
                            onClick={authContext.logout} data-qa="button_logout">
                        Odhlásit
                    </Button>
                    <AuthChecking/>
                </Fragment>}
        </AuthConsumer>
    )
}

export default Menu
