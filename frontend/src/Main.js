import React, { lazy, Suspense, useContext, useState } from "react"
import { NavLink as RouterNavLink, Switch } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Badge, Collapse, Navbar, NavbarBrand, NavbarToggler } from "reactstrap"
import { AuthContext } from "./auth/AuthContext"
import PrivateRoute from "./auth/PrivateRoute"
import AppVersion from "./components/AppVersion"
import Loading from "./components/Loading"
import Menu from "./components/Menu"
import Page from "./components/Page"
import { getEnvName, isEnvDevelopment, isEnvStaging, isEnvTesting } from "./global/funcEnvironments"
import "./Main.css"
import ErrorBoundary from "./pages/ErrorBoundary"
import APP_URLS from "./urls"

// lazy nacitani pro jednotlive stranky
const Dashboard = lazy(() => import("./pages/Dashboard"))
const NotFound = lazy(() => import("./pages/NotFound"))
const Settings = lazy(() => import("./pages/Settings"))
const Applications = lazy(() => import("./pages/Applications"))
const Groups = lazy(() => import("./pages/Groups"))
const Login = lazy(() => import("./pages/Login"))
const Clients = lazy(() => import("./pages/Clients"))
const Card = lazy(() => import("./pages/Card"))
const Diary = lazy(() => import("./pages/Diary"))

const Main = () => {
    const [isMenuOpened, setIsMenuOpened] = useState(false)
    const authContext = useContext(AuthContext)

    function toggleNavbar() {
        setIsMenuOpened(prevIsMenuOpened => !prevIsMenuOpened)
    }

    function closeNavbar() {
        setIsMenuOpened(false)
    }

    return (
        <div className={getEnvName()}>
            <Navbar light className="border-bottom" expand="sm">
                <NavbarBrand tag={RouterNavLink} exact to="/" onClick={closeNavbar}>
                    ÚP<sub>admin</sub>
                </NavbarBrand>
                {isEnvDevelopment() && <Badge color="dark">Vývojová verze</Badge>}
                {isEnvStaging() && (
                    <Badge color="success">
                        Staging <AppVersion />
                    </Badge>
                )}
                {isEnvTesting() && (
                    <Badge color="primary">
                        Testing <AppVersion />
                    </Badge>
                )}
                {authContext.IS_AUTH && <NavbarToggler onClick={toggleNavbar} />}
                <Collapse isOpen={isMenuOpened} navbar>
                    <Menu closeNavbar={closeNavbar} />
                </Collapse>
            </Navbar>
            <ErrorBoundary>
                <ToastContainer position={toast.POSITION.TOP_RIGHT} />
                <main className="content">
                    <Suspense fallback={<Loading />}>
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
                    </Suspense>
                </main>
            </ErrorBoundary>
        </div>
    )
}

export default Main
