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
import PrivateRoute from "./Auth/PrivateRoute"
import Menu from "./components/Menu"
import {ToastContainer} from 'react-toastify'

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
                    <Navbar light className="border-bottom" expand="md">
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
                            <Route path="/prihlasit" component={Login}/>
                            <PrivateRoute exact path="/skupiny" component={Groups}/>
                            <PrivateRoute path="/diar" component={Diary}/>
                            <PrivateRoute exact path="/klienti" component={Clients}/>
                            <PrivateRoute path="/klienti/:id" component={Card}/>
                            <PrivateRoute path="/skupiny/:id" component={Card}/>
                            <PrivateRoute path="/nastaveni" component={Settings}/>
                            <Route component={NotFound}/>
                        </Switch>
                    </div>
                </div>
            </BrowserRouter>
        )
    }
}
