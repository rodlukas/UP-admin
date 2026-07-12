import { Badge, Burger } from "@mantine/core"
import { Link, Outlet, useRouterState } from "@tanstack/react-router"
import classNames from "classnames"
import * as React from "react"

import { useAuthContext } from "./auth/AuthContext"
import AppCommit from "./components/AppCommit"
import AppSpotlight from "./components/AppSpotlight"
import ColorSchemeSync from "./components/ColorSchemeSync"
import Loading from "./components/Loading"
import Menu from "./components/Menu"
import { getEnvName, isEnvDemo, isEnvLocal, isEnvTesting } from "./global/funcEnvironments"
import * as styles from "./Main.css"

/** Hlavní kostra aplikace. */
const Main: React.FC = () => {
    const [isMenuOpened, setIsMenuOpened] = React.useState(false)
    const authContext = useAuthContext()
    const locationPathname = useRouterState({
        select: (state) => state.location.pathname,
    })

    React.useEffect(() => {
        setIsMenuOpened(false)
    }, [locationPathname])

    function toggleNavbar(): void {
        setIsMenuOpened((prevIsMenuOpened) => !prevIsMenuOpened)
    }

    function closeNavbar(): void {
        setIsMenuOpened(false)
    }

    return (
        <div className={getEnvName()}>
            <ColorSchemeSync />
            {authContext.isAuth && (
                <nav className={styles.navbar} aria-label="Hlavní navigace">
                    <div className={styles.navbarInner}>
                        <Link to="/" onClick={closeNavbar} className={styles.navbarBrand}>
                            ÚP<sub>admin</sub>
                        </Link>
                        {isEnvLocal() && (
                            <Badge color="gray" variant="light" className={styles.navbarBadge}>
                                Vývojová verze
                            </Badge>
                        )}
                        {isEnvTesting() && (
                            // tt="none": výchozí uppercase Badge by překreslil commit hash
                            // na velká písmena a vizuálně by neodpovídal `git log`/GitHubu
                            <Badge color="blue" tt="none" className={styles.navbarBadge}>
                                Testing <AppCommit />
                            </Badge>
                        )}
                        {isEnvDemo() && (
                            <Badge color="gray" className={styles.navbarBadge}>
                                DEMO
                            </Badge>
                        )}
                        <Burger
                            opened={isMenuOpened}
                            onClick={toggleNavbar}
                            // burger skrývá px media query v navbarBurger (Main.css.ts), NE
                            // Mantine hiddenFrom: to generuje em-based query (md = 62em), která
                            // se s px breakpointy zbytku navbaru (992px) shoduje jen při
                            // výchozích 16px písma prohlížeče — při jiné velikosti by v pásmu
                            // kolem breakpointu chybělo menu úplně, nebo by byly vidět burger
                            // i rozbalené menu zároveň
                            size="sm"
                            color="white"
                            aria-label={isMenuOpened ? "Zavřít menu" : "Otevřít menu"}
                            className={styles.navbarBurger}
                        />
                        <div
                            className={classNames(styles.navbarCollapse, {
                                [styles.navbarCollapseOpen]: isMenuOpened,
                            })}>
                            <Menu closeNavbar={closeNavbar} />
                        </div>
                    </div>
                </nav>
            )}
            <main
                className={classNames("main", {
                    [styles.isAuthenticated]: authContext.isAuth,
                })}>
                {authContext.isAuth && <AppSpotlight />}
                <React.Suspense fallback={<Loading />}>
                    <Outlet />
                </React.Suspense>
            </main>
        </div>
    )
}

export default Main
