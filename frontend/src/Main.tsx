import * as Fuse from "fuse.js"
import * as React from "react"
import { NavLink as RouterNavLink, Switch, useLocation } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Badge, Collapse, Navbar, NavbarBrand, NavbarToggler } from "reactstrap"
import APP_URLS from "./APP_URLS"
import { AuthContext } from "./auth/AuthContext"
import PrivateRoute from "./auth/PrivateRoute"
import AppCommit from "./components/AppCommit"
import Loading from "./components/Loading"
import Menu from "./components/Menu"
import Page from "./components/Page"
import SearchResults from "./components/SearchResults"
import { ClientsActiveContext } from "./contexts/ClientsActiveContext"
import { getEnvName, isEnvDevelopment, isEnvStaging, isEnvTesting } from "./global/funcEnvironments"
import lazySafe from "./global/lazySafe"
import useKeyPress from "./hooks/useKeyPress"
import "./Main.css"
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

// konfigurace Fuse vyhledavani
const searchOptions: Fuse.FuseOptions<ClientActiveType> = {
    shouldSort: true,
    threshold: 0.5,
    tokenize: true,
    matchAllTokens: true,
    keys: ["normalized", "phone", "email"],
}

/** Hlavní kostra aplikace. */
const Main: React.FC = () => {
    const [isMenuOpened, setIsMenuOpened] = React.useState(false)
    const [foundResults, setFoundResults] = React.useState<Array<ClientActiveType>>([])
    const [searchVal, setSearchVal] = React.useState("")
    const authContext = React.useContext(AuthContext)
    const clientsActiveContext = React.useContext(ClientsActiveContext)
    const location = useLocation()
    const escPress = useKeyPress("Escape")

    const search = React.useCallback(() => {
        if (searchVal !== "" && clientsActiveContext.isLoaded) {
            const results = new Fuse(clientsActiveContext.clients, searchOptions).search(
                searchVal
            ) as Array<ClientActiveType>
            setFoundResults(results)
        }
    }, [searchVal, clientsActiveContext.clients, clientsActiveContext.isLoaded])

    function resetSearch(): void {
        setFoundResults([])
        setSearchVal("")
    }

    React.useEffect(() => {
        resetSearch()
    }, [location, escPress])

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
            <Navbar light className="border-bottom" expand="lg">
                <NavbarBrand tag={RouterNavLink} exact to="/" onClick={closeNavbar}>
                    ÚP<sub>admin</sub>
                </NavbarBrand>
                {isEnvDevelopment() && <Badge color="dark">Vývojová verze</Badge>}
                {isEnvStaging() && (
                    <Badge color="success">
                        Staging <AppCommit />
                    </Badge>
                )}
                {isEnvTesting() && (
                    <Badge color="primary">
                        Testing <AppCommit />
                    </Badge>
                )}
                {authContext.isAuth && <NavbarToggler onClick={toggleNavbar} />}
                <Collapse isOpen={isMenuOpened} navbar>
                    <Menu
                        closeNavbar={closeNavbar}
                        onSearchChange={onSearchChange}
                        searchVal={searchVal}
                    />
                </Collapse>
            </Navbar>
            <ErrorBoundary>
                <ToastContainer position={toast.POSITION.TOP_RIGHT} />
                <main className="content mb-4">
                    <SearchResults
                        foundResults={foundResults}
                        searchVal={searchVal}
                        search={search}
                        resetSearch={resetSearch}
                    />
                    <div className={searchVal !== "" ? "d-none" : undefined}>
                        <React.Suspense fallback={<Loading />}>
                            <Switch>
                                <PrivateRoute
                                    path={APP_URLS.prehled.url}
                                    component={Dashboard}
                                    title={APP_URLS.prehled.title}
                                    exact
                                />
                                <Page
                                    path={APP_URLS.prihlasit.url}
                                    component={Login}
                                    title={APP_URLS.prihlasit.title}
                                />
                                <PrivateRoute
                                    path={APP_URLS.skupiny.url}
                                    component={Groups}
                                    title={APP_URLS.skupiny.title}
                                    exact
                                />
                                <PrivateRoute
                                    path={APP_URLS.diar.url + "/:year?/:month?/:day?"}
                                    component={Diary}
                                    title={APP_URLS.diar.title}
                                />
                                <PrivateRoute
                                    path={APP_URLS.klienti.url}
                                    component={Clients}
                                    title={APP_URLS.klienti.title}
                                    exact
                                />
                                <PrivateRoute
                                    path={APP_URLS.klienti.url + "/:id"}
                                    component={Card}
                                    title={APP_URLS.klienti.title}
                                />
                                <PrivateRoute
                                    path={APP_URLS.skupiny.url + "/:id"}
                                    component={Card}
                                    title={APP_URLS.skupiny.title}
                                />
                                <PrivateRoute
                                    path={APP_URLS.zajemci.url}
                                    component={Applications}
                                    title={APP_URLS.zajemci.title}
                                />
                                <PrivateRoute
                                    path={APP_URLS.nastaveni.url}
                                    component={Settings}
                                    title={APP_URLS.nastaveni.title}
                                />
                                <Page component={NotFound} title={APP_URLS.nenalezeno.title} />
                            </Switch>
                        </React.Suspense>
                    </div>
                </main>
            </ErrorBoundary>
        </div>
    )
}

export default Main
