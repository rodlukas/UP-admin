import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Kbd, UnstyledButton } from "@mantine/core"
import { spotlight } from "@mantine/spotlight"
import {
    faCalendar,
    faChartLine,
    faCog,
    faExternalLink,
    faHourglassHalf,
    faHouse,
    faSearch,
    faSignOut,
    faUser,
    faUsers,
} from "@rodlukas/fontawesome-pro-solid-svg-icons"
import { Link, LinkProps } from "@tanstack/react-router"
import classNames from "classnames"
import * as React from "react"

import APP_URLS from "../APP_URLS"
import AuthChecking from "../auth/AuthChecking"
import { useAuthContext } from "../auth/AuthContext"
import { isApplePlatform } from "../global/utils"
import * as mainStyles from "../Main.css"
import { fEmptyVoid, QA } from "../types/types"

import ColorSchemeToggle from "./ColorSchemeToggle"
import EnvBadge, { hasEnvBadge } from "./EnvBadge"
import * as styles from "./Menu.css"

type Props = {
    /** Funkce pro zavření otevřeného menu (drawer pod breakpointem `md`). */
    closeNavbar: fEmptyVoid
}

type MyNavLinkProps = {
    exact?: boolean
    onCloseNavbar: fEmptyVoid
    icon: typeof faHouse
    label: string
} & QA &
    Omit<LinkProps, "className" | "children">

const MyNavLink: React.FC<MyNavLinkProps> = ({
    exact = false,
    onCloseNavbar,
    icon,
    label,
    ...otherProps
}) => (
    <Link
        {...otherProps}
        onClick={onCloseNavbar}
        activeOptions={{ exact }}
        activeProps={{
            className: classNames(styles.navLink, styles.navLinkActive),
        }}
        inactiveProps={{
            className: styles.navLink,
        }}>
        <FontAwesomeIcon icon={icon} fixedWidth />
        <span className={styles.navLabel}>{label}</span>
    </Link>
)

/** Položky navigace. `qa` atributy jsou kontrakt s E2E kroky — neměnit ani nemazat. */
const NAV_ITEMS = [
    { url: APP_URLS.prehled.url, label: "Přehled", icon: faHouse, exact: true },
    { url: APP_URLS.diar.url, label: "Diář", icon: faCalendar },
    { url: APP_URLS.klienti.url, label: "Klienti", icon: faUser, qa: "menu_clients" },
    { url: APP_URLS.skupiny.url, label: "Skupiny", icon: faUsers, qa: "menu_groups" },
    {
        url: APP_URLS.zajemci.url,
        label: "Zájemci",
        icon: faHourglassHalf,
        qa: "menu_applications",
    },
    {
        url: APP_URLS.statistiky.url,
        label: "Statistiky",
        icon: faChartLine,
        qa: "menu_statistics",
    },
    { url: APP_URLS.nastaveni.url, label: "Nastavení", icon: faCog, qa: "menu_settings" },
] as const

// zkratka zobrazená v UI i v aria-labelu musí odpovídat skutečné klávese
// na dané platformě (mod = ⌘ na Apple platformách, jinde Ctrl)
const spotlightShortcutLabel = isApplePlatform() ? "⌘K" : "Ctrl K"

/** Obsah inkoustového pruhu pro přihlášené uživatele. */
const Menu: React.FC<Props> = ({ closeNavbar }) => {
    const authContext = useAuthContext()
    const onClickLogout = () => {
        closeNavbar()
        authContext.logout()
    }

    if (!authContext.isAuth) {
        return null
    }

    return (
        <>
            <ul className={styles.navList}>
                {NAV_ITEMS.map((item) => (
                    <li key={item.url}>
                        <MyNavLink
                            to={item.url}
                            exact={"exact" in item ? item.exact : false}
                            label={item.label}
                            icon={item.icon}
                            data-qa={"qa" in item ? item.qa : undefined}
                            onCloseNavbar={closeNavbar}
                        />
                    </li>
                ))}
                <li>
                    <a
                        href="https://uspesnyprvnacek.cz/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.navLink}>
                        <FontAwesomeIcon icon={faExternalLink} fixedWidth />
                        <span className={styles.navLabel}>Web</span>
                    </a>
                </li>
            </ul>

            <div className={mainStyles.railSpacer} />

            <div className={mainStyles.railFoot}>
                <UnstyledButton
                    onClick={() => {
                        // na mobilu by jinak rozbalený drawer zůstal otevřený
                        // za Spotlightem (a po jeho zavření dál překrýval obsah)
                        closeNavbar()
                        spotlight.open()
                    }}
                    className={styles.spotlightButton}
                    aria-label={`Otevřít vyhledávání (${spotlightShortcutLabel})`}>
                    <FontAwesomeIcon icon={faSearch} fixedWidth />
                    <span className={styles.navLabel}>Hledat</span>
                    <Kbd className={styles.navShortcut}>{spotlightShortcutLabel}</Kbd>
                </UnstyledButton>

                <ColorSchemeToggle />

                <UnstyledButton
                    onClick={onClickLogout}
                    data-qa="button_logout"
                    className={styles.railButton}>
                    <FontAwesomeIcon icon={faSignOut} fixedWidth />
                    <span className={styles.navLabel}>Odhlásit</span>
                </UnstyledButton>

                {hasEnvBadge() && (
                    <p className={mainStyles.railEnv}>
                        <EnvBadge />
                    </p>
                )}
            </div>

            <AuthChecking />
        </>
    )
}

export default Menu
