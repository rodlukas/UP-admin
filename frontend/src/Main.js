import React, {Component} from "react"
import {Route, NavLink as RouterNavLink, BrowserRouter, Switch} from "react-router-dom"
import Clients from "./lists/Clients"
import Card from "./lists/Card"
import Diary from "./days/Diary"
import Groups from "./lists/Groups"
import Dashboard from "./days/Dashboard"
import NotFound from "./NotFound";
import {Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink} from 'reactstrap'
import {Login, PrivateRoute, AuthButton} from "./Auth/Login"

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
                            ÚP<sub>admin</sub></NavbarBrand>
                        <NavbarToggler onClick={this.toggle}/>
                        <Collapse isOpen={this.state.isOpen} navbar>
                            <Nav className="ml-auto" navbar>
                                <NavItem>
                                    <NavLink tag={RouterNavLink} exact activeClassName="active" to="/">Přehled</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={RouterNavLink} to="/diar">Diář</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={RouterNavLink} to="/klienti">Klienti</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={RouterNavLink} to="/skupiny">Skupiny</NavLink>
                                </NavItem>
                            </Nav>
                            <AuthButton/>
                        </Collapse>
                    </Navbar>
                    <div className="content">
                        <Switch>
                            <PrivateRoute exact path="/" component={Dashboard}/>
                            <Route path="/prihlasit" component={Login}/>
                            <PrivateRoute exact path="/skupiny" component={Groups}/>
                            <PrivateRoute path="/diar" component={Diary}/>
                            <PrivateRoute exact path="/klienti" component={Clients}/>
                            <PrivateRoute path="/klienti/:id" component={Card}/>
                            <PrivateRoute path="/skupiny/:id" component={Card}/>
                            <Route component={NotFound}/>
                        </Switch>
                    </div>
                </div>
            </BrowserRouter>
        )
    }
}
