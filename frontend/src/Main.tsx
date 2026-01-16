import classNames from "classnames"
import Fuse, { IFuseOptions, FuseResult } from "fuse.js"
import * as React from "react"
import { NavLink as RouterNavLink, Route, Routes, useLocation } from "react-router-dom"
import { Slide, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Badge, Collapse, Navbar, NavbarBrand, NavbarToggler } from "reactstrap"

import APP_URLS from "./APP_URLS"
import { useAuthContext } from "./auth/AuthContext"
import PrivateRoute from "./auth/PrivateRoute"
import AppCommit from "./components/AppCommit"
import Loading from "./components/Loading"
import Menu from "./components/Menu"
import Page from "./components/Page"
import Search from "./components/Search"
import { useClientsActiveContext } from "./contexts/ClientsActiveContext"
import { getEnvName, isEnvDemo, isEnvLocal, isEnvTesting } from "./global/funcEnvironments"
import lazySafe from "./global/lazySafe"
import { isModalShown } from "./global/utils"
import useKeyPress from "./hooks/useKeyPress"
import * as styles from "./Main.css"
import ErrorBoundary from "./pages/ErrorBoundary"
import { ClientActiveType } from "./types/models"

// lazy nacitani pro jednotlive stranky
const Dashboard = React.lazy(() => lazySafe(() => import("./pages/Dashboard")))
const NotFound = React.lazy(() => lazySafe(() => import("./pages/NotFound")))
const Settings = React.lazy(() => lazySafe(() => import("./pages/Settings")))
const Applications = React.lazy(() => lazySafe(() => import("./pages/Applications")))
const Groups = React.lazy(() => lazySafe(() => import("./pages/Groups")))
const Login = React.lazy(() => lazySafe(() => import("./pages/Login")))
const Clients = React.lazy(() => lazySafe(() => import("./pages/Clients")))
const Card = React.lazy(() => lazySafe(() => import("./pages/Card")))
const Diary = React.lazy(() => lazySafe(() => import("./pages/Diary")))

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
    const authContext = useAuthContext()
    const clientsActiveContext = useClientsActiveContext()
    const location = useLocation()
    const escPress = useKeyPress("Escape")

    const search = React.useCallback(() => {
        if (searchVal !== "" && !clientsActiveContext.isLoading) {
            const results = new Fuse(clientsActiveContext.clients, searchOptions).search(searchVal)
            setFoundResults(results)
        }
    }, [searchVal, clientsActiveContext.clients, clientsActiveContext.isLoading])

    function resetSearch(): void {
        setFoundResults([])
        setSearchVal("")
    }

    React.useEffect(() => {
        resetSearch()
    }, [location])

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

    const privateRoutes = [
        {
            path: APP_URLS.prehled.url,
            title: APP_URLS.prehled.title,
            element: <Dashboard />,
        },
        {
            path: APP_URLS.skupiny.url,
            title: APP_URLS.skupiny.title,
            element: <Groups />,
        },
        {
            path: `${APP_URLS.diar.url}/:year?/:month?/:day?`,
            element: <Diary />,
        },
        {
            path: APP_URLS.klienti.url,
            title: APP_URLS.klienti.title,
            element: <Clients />,
        },
        {
            path: APP_URLS.klienti_karta.url,
            element: <Card />,
        },
        {
            path: APP_URLS.skupiny_karta.url,
            element: <Card />,
        },
        {
            path: APP_URLS.zajemci.url,
            title: APP_URLS.zajemci.title,
            element: <Applications />,
        },
        {
            path: APP_URLS.nastaveni.url,
            title: APP_URLS.nastaveni.title,
            element: <Settings />,
        },
    ]
    const publicRoutes = [
        {
            path: APP_URLS.prihlasit.url,
            title: APP_URLS.prihlasit.title,
            element: <Login />,
        },
        {
            path: APP_URLS.nenalezeno.url,
            title: APP_URLS.nenalezeno.title,
            element: <NotFound />,
        },
        {
            path: "*",
            title: APP_URLS.nenalezeno.title,
            element: <NotFound />,
        },
    ]

    return (
        <div className={getEnvName()}>
            {authContext.isAuth && (
                <Navbar className="bg-dark" expand="lg" dark fixed="top" container={true}>
                    <NavbarBrand tag={RouterNavLink} end to="/" onClick={closeNavbar}>
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
                <ErrorBoundary>
                    <ToastContainer position="top-right" theme="colored" transition={Slide} />
                    <Search
                        foundResults={foundResults}
                        searchVal={searchVal}
                        search={search}
                        resetSearch={resetSearch}
                    />
                    <React.Suspense fallback={<Loading />}>
                        <Routes>
                            {publicRoutes.map(({ path, title, element }) => (
                                <Route
                                    key={path}
                                    path={path}
                                    element={<Page title={title}>{element}</Page>}
                                />
                            ))}
                            {privateRoutes.map(({ path, title, element }) => (
                                <Route
                                    key={path}
                                    path={path}
                                    element={<PrivateRoute title={title}>{element}</PrivateRoute>}
                                />
                            ))}
                        </Routes>
                    </React.Suspense>
                </ErrorBoundary>
            </main>
        </div>
    )
}

export default Main
