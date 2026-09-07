import { AppShell, Burger } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { Link, Outlet, useRouterState } from "@tanstack/react-router"
import classNames from "classnames"
import * as React from "react"

import { useAuthContext } from "./auth/AuthContext"
import AppSpotlight from "./components/AppSpotlight"
import ColorSchemeSync from "./components/ColorSchemeSync"
import EnvBadge from "./components/EnvBadge"
import Menu from "./components/Menu"
import { PageSkeleton } from "./components/Skeletons"
import { RAIL_WIDTH_LABELS } from "./global/constants"
import { getEnvName } from "./global/funcEnvironments"
import * as styles from "./Main.css"

/**
 * Musí odpovídat `navbar.breakpoint` níže (Mantine `md` = 62em). Pod ním se pruh
 * chová jako drawer a jediné, co z chrome zbyde, je slim hlavička s burgerem.
 */
const MOBILE_QUERY = "(max-width: 61.99em)"

/** Hlavní kostra aplikace. */
const Main: React.FC = () => {
    const [isMenuOpened, setIsMenuOpened] = React.useState(false)
    const authContext = useAuthContext()
    const locationPathname = useRouterState({
        select: (state) => state.location.pathname,
    })
    // `getInitialValueInEffect: false` — aplikace bezi jen CSR (zadny SSR/hydration),
    // takze spravnou sirku pruhu potrebujeme uz pri prvnim renderu; jinak by pruh
    // na prvni frame problikl v opacnem stavu.
    const isMobile = useMediaQuery(MOBILE_QUERY, false, { getInitialValueInEffect: false })

    React.useEffect(() => {
        setIsMenuOpened(false)
    }, [locationPathname])

    function toggleNavbar(): void {
        setIsMenuOpened((prevIsMenuOpened) => !prevIsMenuOpened)
    }

    function closeNavbar(): void {
        setIsMenuOpened(false)
    }

    // Nepřihlášené stránky (přihlášení, 404) nemají navigaci, a tedy ani kostru —
    // obsah se tak dá vycentrovat přes celou výšku viewportu.
    if (!authContext.isAuth) {
        return (
            <div className={getEnvName()}>
                <ColorSchemeSync />
                <main className="main">
                    <React.Suspense fallback={<PageSkeleton />}>
                        <Outlet />
                    </React.Suspense>
                </main>
            </div>
        )
    }

    return (
        <div className={getEnvName()}>
            <ColorSchemeSync />
            <AppShell
                padding={0}
                // rámečky sekcí si kreslíme sami (`border.rail`), Mantine by použil
                // barvu z palety, která na inkoustu není vidět
                withBorder={false}
                header={{ height: styles.MOBILE_HEADER_HEIGHT, collapsed: !isMobile }}
                navbar={{
                    width: RAIL_WIDTH_LABELS,
                    breakpoint: "md",
                    collapsed: { mobile: !isMenuOpened },
                }}>
                {/* `collapsed` na AppShell.Header/Navbar jen posouvá obsah transformem
                    (`translateY`/`translateX`) mimo viditelnou plochu — na rozdíl od
                    dřívějších `display: none` pravidel (viz git historie Main.css.ts)
                    zůstává skrytý obsah dosažitelný Tabem a čtečkám. `inert` ho vyřazuje
                    z obojího, aniž by to muselo zasahovat do vzhledu/animace collapse. */}
                <AppShell.Header className={styles.shellHeader} inert={!isMobile}>
                    <Burger
                        opened={isMenuOpened}
                        onClick={toggleNavbar}
                        size="sm"
                        color="white"
                        aria-label={isMenuOpened ? "Zavřít menu" : "Otevřít menu"}
                    />
                    <Link to="/" onClick={closeNavbar} className={styles.headerBrand}>
                        ÚP<sub>admin</sub>
                    </Link>
                    {/* Pod `md` je pruh zavřený drawer, takže označení prostředí by z něj
                        nebylo vidět na žádné trase — na mobilu ho proto nese hlavička. */}
                    <div className={styles.headerEnv}>
                        <EnvBadge />
                    </div>
                </AppShell.Header>
                <AppShell.Navbar
                    className={styles.rail}
                    aria-label="Hlavní navigace"
                    inert={isMobile && !isMenuOpened}>
                    {/* Ve slim hlavičce už značka je, v drawer režimu by byla dvakrát. */}
                    {!isMobile && (
                        <Link to="/" onClick={closeNavbar} className={styles.railBrand}>
                            ÚP<sub>admin</sub>
                        </Link>
                    )}
                    <Menu closeNavbar={closeNavbar} />
                </AppShell.Navbar>
                <AppShell.Main className={classNames("main", styles.plane)}>
                    <AppSpotlight />
                    <React.Suspense fallback={<PageSkeleton />}>
                        <Outlet />
                    </React.Suspense>
                </AppShell.Main>
            </AppShell>
        </div>
    )
}

export default Main
