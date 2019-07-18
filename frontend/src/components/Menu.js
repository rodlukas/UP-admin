import React, {Fragment, useContext} from "react"
import {NavLink as RouterNavLink} from "react-router-dom"
import {Button, Nav, NavItem, NavLink} from "reactstrap"
import AuthChecking from "../auth/AuthChecking"
import {AuthContext} from "../auth/AuthContext"
import APP_URLS from "../urls"
import "./Menu.css"

const Menu = props => {
    const authContext = useContext(AuthContext)
    const MyNavLink = otherProps =>
        <NavLink onClick={props.closeNavbar} tag={RouterNavLink} {...otherProps}/>
    return (
        <Fragment>
            {authContext.IS_AUTH &&
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
        </Fragment>
    )
}

export default Menu
