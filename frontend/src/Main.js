import React, {Component} from "react"
import {Route, NavLink as RouterNavLink, BrowserRouter, Switch} from "react-router-dom"
import Clients from "./pages/Clients"
import Card from "./pages/Card"
import Diary from "./pages/Diary"
import Groups from "./pages/Groups"
import Dashboard from "./pages/Dashboard"
import NotFound from "./pages/NotFound"
import Settings from "./pages/Settings"
import {Collapse, Navbar, NavbarToggler, NavbarBrand} from 'reactstrap'
import Login from "./pages/Login"
import PrivateRoute from "./auth/PrivateRoute"
import Menu from "./components/Menu"
import {ToastContainer} from 'react-toastify'
import APP_URLS from "./urls"

export default class Main extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isOpen: false
        }
    }

    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    render() {
        return (
            <BrowserRouter>
                <div>
                    <Navbar light className="border-bottom" expand="sm">
                        <NavbarBrand tag={RouterNavLink} exact to="/">
                            ÚP<sub>admin</sub>
                        </NavbarBrand>
                        <NavbarToggler onClick={this.toggle}/>
                        <Collapse isOpen={this.state.isOpen} navbar>
                            <Menu/>
                        </Collapse>
                    </Navbar>
                    <ToastContainer/>
                    <div className="content">
                        <Switch>
                            <PrivateRoute exact path="/" component={Dashboard}/>
                            <Route path={APP_URLS.prihlasit} component={Login}/>
                            <PrivateRoute exact path={APP_URLS.skupiny} component={Groups}/>
                            <PrivateRoute path={APP_URLS.diar + "/:year?/:month?/:day?"} component={Diary}/>
                            <PrivateRoute exact path={APP_URLS.klienti} component={Clients}/>
                            <PrivateRoute path={APP_URLS.klienti + "/:id"} component={Card}/>
                            <PrivateRoute path={APP_URLS.skupiny + "/:id"} component={Card}/>
                            <PrivateRoute path={APP_URLS.nastaveni} component={Settings}/>
                            <Route component={NotFound}/>
                        </Switch>
                    </div>
                </div>
            </BrowserRouter>
        )
    }
}
