import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faExternalLink } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import { Link, LinkProps } from "@tanstack/react-router"
import classNames from "classnames"
import * as React from "react"
import { Button, Nav, NavItem, NavLink } from "reactstrap"

import APP_URLS from "../APP_URLS"
import AuthChecking from "../auth/AuthChecking"
import { useAuthContext } from "../auth/AuthContext"
import { fEmptyVoid, QA } from "../types/types"

import * as styles from "./Menu.css"
import SearchInput from "./SearchInput"

type Props = {
    /** Funkce pro zavření otevřeného hamburger menu. */
    closeNavbar: fEmptyVoid
    /** Funkce, která se zavolá při úpravě vyhledávaného výrazu. */
    onSearchChange: (newSearchVal: string) => void
    /** Hledaný výraz. */
    searchVal: string
}

type MyNavLinkProps = {
    className?: string
    activeClassName?: string
    exact?: boolean
} & QA &
    Omit<LinkProps, "className">

/** Komponenta zobrazující menu aplikace pro přihlášené uživatele. */
const Menu: React.FC<Props> = (props) => {
    const authContext = useAuthContext()
    const MyNavLink: React.FC<MyNavLinkProps> = ({
        className,
        activeClassName = "active",
        exact = false,
        ...otherProps
    }) => (
        <Link
            {...otherProps}
            onClick={props.closeNavbar}
            activeOptions={{ exact }}
            activeProps={{
                className: classNames("nav-link", className, activeClassName),
            }}
            inactiveProps={{
                className: classNames("nav-link", className),
            }}
        />
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
                    <SearchInput
                        onSearchChange={props.onSearchChange}
                        searchVal={props.searchVal}
                    />
                    <Nav className="ms-auto" navbar>
                        <NavItem>
                            <MyNavLink exact to={APP_URLS.prehled.url}>
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
                        <NavItem>
                            <NavLink
                                href="https://uspesnyprvnacek.cz/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.navExternalLink}>
                                Web&nbsp;
                                <FontAwesomeIcon icon={faExternalLink} />
                            </NavLink>
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
