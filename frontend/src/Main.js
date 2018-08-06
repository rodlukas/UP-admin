import React, {Component} from "react"
import {Route, NavLink as RouterNavLink, BrowserRouter, Switch} from "react-router-dom"
import Clients from "./pages/Clients"
import Card from "./pages/Card"
import Diary from "./pages/Diary"
import Groups from "./pages/Groups"
import Dashboard from "./pages/Dashboard"
import NotFound from "./pages/NotFound"
import Settings from "./pages/Settings"
import Applications from "./pages/Applications"
import {Collapse, Navbar, NavbarToggler, NavbarBrand, Badge} from "reactstrap"
import Login from "./pages/Login"
import PrivateRoute from "./auth/PrivateRoute"
import Menu from "./components/Menu"
import {ToastContainer} from "react-toastify"
import "react-toastify/dist/ReactToastify.min.css"
import APP_URLS from "./urls"

export default class Main extends Component {
    state = {
        IS_MENU_OPEN: false
    }

    toggle = () => {
        this.setState({IS_MENU_OPEN: !this.state.IS_MENU_OPEN})
    }

    render() {
        const appUrl = window.location.hostname.split(".")[0]
        let mainClass = process.env.NODE_ENV
        let IS_STAGING = false
        if (appUrl === "uspesnyprvnacek-staging")
        {
            IS_STAGING = true
            mainClass += " staging"
        }
        return (
            <BrowserRouter>
                <div className={mainClass}>
                    <Navbar light className="border-bottom" expand="sm">
                        <NavbarBrand tag={RouterNavLink} exact to="/">
                            ÚP<sub>admin</sub>
                        </NavbarBrand>
                        {process.env.NODE_ENV === 'development' &&
                        <Badge color="dark">
                            Vývojová verze GIT_VERSION
                        </Badge>}
                        {IS_STAGING &&
                        <Badge color="success">
                            Staging verze GIT_VERSION
                        </Badge>}
                        <NavbarToggler onClick={this.toggle}/>
                        <Collapse isOpen={this.state.IS_MENU_OPEN} navbar>
                            <Menu/>
                        </Collapse>
                    </Navbar>
                    <ToastContainer/>
                    <div className="content">
                        <Switch>
                            <PrivateRoute
                                path={APP_URLS.prehled} component={Dashboard} exact/>
                            <Route
                                path={APP_URLS.prihlasit} component={Login}/>
                            <PrivateRoute
                                path={APP_URLS.skupiny} component={Groups} exact/>
                            <PrivateRoute
                                path={APP_URLS.diar + "/:year?/:month?/:day?"} component={Diary}/>
                            <PrivateRoute
                                path={APP_URLS.klienti} component={Clients} exact/>
                            <PrivateRoute
                                path={APP_URLS.klienti + "/:id"} component={Card}/>
                            <PrivateRoute
                                path={APP_URLS.skupiny + "/:id"} component={Card}/>
                            <PrivateRoute
                                path={APP_URLS.zajemci} component={Applications}/>
                            <PrivateRoute
                                path={APP_URLS.nastaveni} component={Settings}/>
                            <Route component={NotFound}/>
                        </Switch>
                    </div>
                </div>
            </BrowserRouter>
        )
    }
}
