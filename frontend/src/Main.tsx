import { Badge, Burger } from "@mantine/core"
import { Link, Outlet, useRouterState } from "@tanstack/react-router"
import classNames from "classnames"
import * as React from "react"

import { useAuthContext } from "./auth/AuthContext"
import AppCommit from "./components/AppCommit"
import AppSpotlight from "./components/AppSpotlight"
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
                            <Badge color="blue" className={styles.navbarBadge}>
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
                            hiddenFrom="lg"
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
<AppSpotlight />
                <React.Suspense fallback={<Loading />}>
                    <Outlet />
                </React.Suspense>
            </main>
        </div>
    )
}

export default Main
