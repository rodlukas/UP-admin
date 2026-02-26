import { Link, Outlet, useRouterState } from "@tanstack/react-router"
import classNames from "classnames"
import Fuse, { IFuseOptions, FuseResult } from "fuse.js"
import * as React from "react"
import { Slide, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Badge, Collapse, Navbar, NavbarBrand, NavbarToggler } from "reactstrap"

import { trackEvent } from "./analytics"
import { useAuthContext } from "./auth/AuthContext"
import AppCommit from "./components/AppCommit"
import Loading from "./components/Loading"
import Menu from "./components/Menu"
import Search from "./components/Search"
import { useClientsActiveContext } from "./contexts/ClientsActiveContext"
import { getEnvName, isEnvDemo, isEnvLocal, isEnvTesting } from "./global/funcEnvironments"
import { isModalShown } from "./global/utils"
import useKeyPress from "./hooks/useKeyPress"
import * as styles from "./Main.css"
import { ClientActiveType } from "./types/models"

// konfigurace Fuse.js vyhledavani
const searchOptions: IFuseOptions<ClientActiveType> = {
    shouldSort: true,
    ignoreDiacritics: true,
    threshold: 0.5,
    keys: ["firstname", "surname", "phone", "email", "normalized"],
}

/** Hlavní kostra aplikace. */
const Main: React.FC = () => {
    const [isMenuOpened, setIsMenuOpened] = React.useState(false)
    const [foundResults, setFoundResults] = React.useState<FuseResult<ClientActiveType>[]>([])
    const [searchVal, setSearchVal] = React.useState("")
    const [searchSessionTracked, setSearchSessionTracked] = React.useState(false)
    const authContext = useAuthContext()
    const clientsActiveContext = useClientsActiveContext()
    const locationPathname = useRouterState({
        select: (state) => state.location.pathname,
    })
    const escPress = useKeyPress("Escape")

    const search = React.useCallback(() => {
        if (searchVal !== "" && !clientsActiveContext.isLoading) {
            const results = new Fuse(clientsActiveContext.clients, searchOptions).search(searchVal)
            setFoundResults(results)
            if (!searchSessionTracked) {
                trackEvent("search_used", { has_results: results.length > 0 })
                setSearchSessionTracked(true)
            }
        }
    }, [searchVal, clientsActiveContext.clients, clientsActiveContext.isLoading, searchSessionTracked])

    function resetSearch(): void {
        setFoundResults([])
        setSearchVal("")
        setSearchSessionTracked(false)
    }

    React.useEffect(() => {
        resetSearch()
        // pri odchodu z vyhledavani zavreme menu
        setIsMenuOpened(false)
    }, [locationPathname])

    React.useEffect(() => {
        if (!isModalShown()) {
            resetSearch()
        }
    }, [escPress])

    React.useEffect(() => {
        search()
    }, [search])

    React.useEffect(() => {
        if (!isMenuOpened) {
            resetSearch()
        }
    }, [isMenuOpened])

    function toggleNavbar(): void {
        setIsMenuOpened((prevIsMenuOpened) => !prevIsMenuOpened)
    }

    function closeNavbar(): void {
        setIsMenuOpened(false)
    }

    function onSearchChange(newSearchVal: string): void {
        setSearchVal(newSearchVal)
    }

    return (
        <div className={getEnvName()}>
            {authContext.isAuth && (
                <Navbar className="bg-dark" expand="lg" dark fixed="top" container={true}>
                    <NavbarBrand tag={Link} to="/" onClick={closeNavbar}>
                        ÚP<sub>admin</sub>
                    </NavbarBrand>
                    {isEnvLocal() && <Badge color="light">Vývojová verze</Badge>}
                    {isEnvTesting() && (
                        <Badge color="primary">
                            Testing <AppCommit pageId="Main" />
                        </Badge>
                    )}
                    {isEnvDemo() && <Badge color="secondary">DEMO</Badge>}
                    <NavbarToggler onClick={toggleNavbar} />
                    <Collapse isOpen={isMenuOpened} navbar>
                        <Menu
                            closeNavbar={closeNavbar}
                            onSearchChange={onSearchChange}
                            searchVal={searchVal}
                        />
                    </Collapse>
                </Navbar>
            )}
            <main
                className={classNames("main", "mb-4", {
                    [styles.isAuthenticated]: authContext.isAuth,
                })}>
                <ToastContainer position="top-right" theme="colored" transition={Slide} />
                <Search
                    foundResults={foundResults}
                    searchVal={searchVal}
                    search={search}
                    resetSearch={resetSearch}
                />
                <React.Suspense fallback={<Loading />}>
                    <Outlet />
                </React.Suspense>
            </main>
        </div>
    )
}

export default Main
