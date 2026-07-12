import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Kbd, UnstyledButton } from "@mantine/core"
import { spotlight } from "@mantine/spotlight"
import { faExternalLink, faSearch } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import { Link, LinkProps } from "@tanstack/react-router"
import classNames from "classnames"
import * as React from "react"

import APP_URLS from "../APP_URLS"
import AuthChecking from "../auth/AuthChecking"
import { useAuthContext } from "../auth/AuthContext"
import { isApplePlatform } from "../global/utils"
import { fEmptyVoid, QA } from "../types/types"

import ColorSchemeToggle from "./ColorSchemeToggle"
import * as styles from "./Menu.css"

type Props = {
    /** Funkce pro zavření otevřeného hamburger menu. */
    closeNavbar: fEmptyVoid
}

type MyNavLinkProps = {
    className?: string
    activeClassName?: string
    exact?: boolean
    onCloseNavbar: fEmptyVoid
} & QA &
    Omit<LinkProps, "className">

const MyNavLink: React.FC<MyNavLinkProps> = ({
    className,
    activeClassName = "active",
    exact = false,
    onCloseNavbar,
    ...otherProps
}) => (
    <Link
        {...otherProps}
        onClick={onCloseNavbar}
        activeOptions={{ exact }}
        activeProps={{
            className: classNames(styles.navLink, className, activeClassName),
        }}
        inactiveProps={{
            className: classNames(styles.navLink, className),
        }}
    />
)

// zkratka zobrazená v UI i v aria-labelu musí odpovídat skutečné klávese
// na dané platformě (mod = ⌘ na Apple platformách, jinde Ctrl)
const spotlightShortcutLabel = isApplePlatform() ? "⌘K" : "Ctrl K"

/** Komponenta zobrazující menu aplikace pro přihlášené uživatele. */
const Menu: React.FC<Props> = (props) => {
    const authContext = useAuthContext()
    const onClickLogout = () => {
        props.closeNavbar()
        authContext.logout()
    }

    return (
        <>
            {authContext.isAuth && (
                <>
                    <UnstyledButton
                        onClick={() => {
                            // na mobilu by jinak rozbalené burger menu zůstalo otevřené
                            // za Spotlightem (a po jeho zavření dál překrývalo obsah)
                            props.closeNavbar()
                            spotlight.open()
                        }}
                        className={styles.spotlightButton}
                        aria-label={`Otevřít vyhledávání (${spotlightShortcutLabel})`}>
                        <FontAwesomeIcon icon={faSearch} fixedWidth />
                        <span className={styles.spotlightButtonLabel}>
                            Hledat klienta, skupinu...
                        </span>
                        <Kbd size="xs">{spotlightShortcutLabel}</Kbd>
                    </UnstyledButton>
                    <ul className={styles.navList}>
                        <li>
                            <MyNavLink
                                exact
                                to={APP_URLS.prehled.url}
                                onCloseNavbar={props.closeNavbar}>
                                Přehled
                            </MyNavLink>
                        </li>
                        <li>
                            <MyNavLink to={APP_URLS.diar.url} onCloseNavbar={props.closeNavbar}>
                                Diář
                            </MyNavLink>
                        </li>
                        <li>
                            <MyNavLink
                                to={APP_URLS.klienti.url}
                                data-qa="menu_clients"
                                onCloseNavbar={props.closeNavbar}>
                                Klienti
                            </MyNavLink>
                        </li>
                        <li>
                            <MyNavLink
                                to={APP_URLS.skupiny.url}
                                data-qa="menu_groups"
                                onCloseNavbar={props.closeNavbar}>
                                Skupiny
                            </MyNavLink>
                        </li>
                        <li>
                            <MyNavLink
                                to={APP_URLS.zajemci.url}
                                data-qa="menu_applications"
                                onCloseNavbar={props.closeNavbar}>
                                Zájemci
                            </MyNavLink>
                        </li>
                        <li>
                            <MyNavLink
                                to={APP_URLS.statistiky.url}
                                data-qa="menu_statistics"
                                onCloseNavbar={props.closeNavbar}>
                                Statistiky
                            </MyNavLink>
                        </li>
                        <li>
                            <MyNavLink
                                to={APP_URLS.nastaveni.url}
                                data-qa="menu_settings"
                                onCloseNavbar={props.closeNavbar}>
                                Nastavení
                            </MyNavLink>
                        </li>
                        <li>
                            <a
                                href="https://uspesnyprvnacek.cz/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={classNames(styles.navLink, styles.navExternalLink)}>
                                Web&nbsp;
                                <FontAwesomeIcon icon={faExternalLink} />
                            </a>
                        </li>
                    </ul>
                    <ColorSchemeToggle />
                    <Button
                        variant="filled"
                        color="gray"
                        size="sm"
                        onClick={onClickLogout}
                        data-qa="button_logout"
                        className={styles.logoutButton}>
                        Odhlásit
                    </Button>
                    <AuthChecking />
                </>
            )}
        </>
    )
}

export default Menu
