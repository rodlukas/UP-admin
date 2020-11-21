import * as React from "react"
import { NavLink as RouterNavLink, NavLinkProps as RouterNavLinkProps } from "react-router-dom"
import { Button, Nav, NavItem, NavLink } from "reactstrap"
import APP_URLS from "../APP_URLS"
import AuthChecking from "../auth/AuthChecking"
import { AuthContext } from "../auth/AuthContext"
import { fEmptyVoid, QA } from "../types/types"
import "./Menu.css"
import Search from "./Search"

type Props = {
    /** Funkce pro zavření otevřeného hamburger menu. */
    closeNavbar: fEmptyVoid
    /** Funkce, která se zavolá při úpravě vyhledávaného výrazu. */
    onSearchChange: (newSearchVal: string) => void
    /** Vyhledávaný výraz. */
    searchVal: string
}

type MyNavLinkProps = QA & RouterNavLinkProps

/** Komponenta zobrazující menu aplikace pro přihlášené uživatele. */
const Menu: React.FC<Props> = (props) => {
    const authContext = React.useContext(AuthContext)
    const MyNavLink: React.FC<MyNavLinkProps> = (otherProps) => (
        <NavLink onClick={props.closeNavbar} tag={RouterNavLink} {...otherProps} />
    )
    const onClickLogout = () => {
        // pri odhlaseni chceme zavrit menu
        props.closeNavbar()
        authContext.logout()
    }

    return (
        <>
            {authContext.isAuth && (
                <>
                    <Search onSearchChange={props.onSearchChange} searchVal={props.searchVal} />
                    <Nav className="ml-auto" navbar>
                        <NavItem>
                            <MyNavLink exact activeClassName="active" to={APP_URLS.prehled.url}>
                                Přehled
                            </MyNavLink>
                        </NavItem>
                        <NavItem>
                            <MyNavLink to={APP_URLS.diar.url}>Diář</MyNavLink>
                        </NavItem>
                        <NavItem>
                            <MyNavLink to={APP_URLS.klienti.url} data-qa="menu_clients">
                                Klienti
                            </MyNavLink>
                        </NavItem>
                        <NavItem>
                            <MyNavLink to={APP_URLS.skupiny.url} data-qa="menu_groups">
                                Skupiny
                            </MyNavLink>
                        </NavItem>
                        <NavItem>
                            <MyNavLink to={APP_URLS.zajemci.url} data-qa="menu_applications">
                                Zájemci
                            </MyNavLink>
                        </NavItem>
                        <NavItem>
                            <MyNavLink to={APP_URLS.nastaveni.url} data-qa="menu_settings">
                                Nastavení
                            </MyNavLink>
                        </NavItem>
                    </Nav>
                    <Button color="secondary" onClick={onClickLogout} data-qa="button_logout">
                        Odhlásit
                    </Button>
                    <AuthChecking />
                </>
            )}
        </>
    )
}

export default Menu
