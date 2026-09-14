import { AppShell, Burger } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { Link, Outlet, useRouter, useRouterState } from "@tanstack/react-router"
import classNames from "classnames"
import * as React from "react"

import { useAuthContext } from "./auth/AuthContext"
import AppSpotlight from "./components/AppSpotlight"
import ColorSchemeSync from "./components/ColorSchemeSync"
import EnvBadge, { hasEnvBadge } from "./components/EnvBadge"
import Menu from "./components/Menu"
import { PageSkeleton } from "./components/Skeletons"
import { NAVBAR_BREAKPOINT, RAIL_WIDTH_LABELS } from "./global/constants"
import { getEnvName } from "./global/funcEnvironments"
import * as styles from "./Main.css"

/**
 * Pod `NAVBAR_BREAKPOINT` se pruh chová jako drawer a jediné, co z chrome zbyde, je slim
 * hlavička s burgerem — viz komentář u `NAVBAR_BREAKPOINT`, proč je to sdílená konstanta,
 * ne ručně vypsaná hodnota.
 */
const MOBILE_QUERY = `(max-width: ${NAVBAR_BREAKPOINT})`

/** Hlavní kostra aplikace. */
const Main: React.FC = () => {
    const [isMenuOpened, setIsMenuOpened] = React.useState(false)
    const authContext = useAuthContext()
    const router = useRouter()
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

    // Bez vlastního záznamu v historii nemá systémové/gesto tlačítko zpět co zavřít —
    // rovnou by odnavigovalo na předchozí stránku (menu by se zavřelo, ale až jako
    // vedlejší efekt odchodu ze stránky, viz efekt výše). Push na stejnou URL dá tlačítku
    // zpět co „spotřebovat": prohlížeč se vrátí na tentýž záznam, k navigaci nedojde
    // a `popstate` níž jen zavře menu. Jde přes `router.history`, ne přímo přes
    // `window.history.pushState` — TanStack Router si `pushState` interně přepisuje
    // a čeká vlastní tvar `state` (index pro `canGoBack`/delta výpočet u dalších popstate).
    React.useEffect(() => {
        if (!isMenuOpened) {
            return undefined
        }

        router.history.push(router.history.location.href)

        function handlePopState(): void {
            setIsMenuOpened(false)
        }

        window.addEventListener("popstate", handlePopState)
        return () => {
            window.removeEventListener("popstate", handlePopState)
        }
    }, [isMenuOpened, router])

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
                    breakpoint: NAVBAR_BREAKPOINT,
                    collapsed: { mobile: !isMenuOpened },
                }}>
                {/* `collapsed` na AppShell.Header/Navbar jen posouvá obsah transformem
                    (`translateY`/`translateX`) mimo viditelnou plochu, takže skrytý obsah
                    zůstává dosažitelný Tabem a čtečkám. `inert` ho z obojího vyřazuje,
                    aniž by to muselo zasahovat do vzhledu/animace collapse. */}
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
                    {hasEnvBadge() && (
                        <div className={styles.headerEnv}>
                            <EnvBadge />
                        </div>
                    )}
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
