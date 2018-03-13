import React, {Component} from "react"
import {Route, NavLink as RouterNavLink, HashRouter} from "react-router-dom"
import Clients from "./clients/Clients"
import ClientView from "./clients/ClientView"
import Diary from "./Diary"
import Groups from "./Groups"
import Dashboard from "./dashboard/Dashboard"
import {Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink} from 'reactstrap'

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
            <HashRouter>
                <div>
                    <Navbar color="faded" light expand="md" className="border-bottom">
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
                        </Collapse>
                    </Navbar>
                    <div className="content">
                        <Route exact path="/" component={Dashboard}/>
                        <Route path="/skupiny" component={Groups}/>
                        <Route path="/diar" component={Diary}/>
                        <Route exact path="/klienti" component={Clients}/>
                        <Route path="/klienti/:clientId" component={ClientView}/>
                    </div>
                </div>
            </HashRouter>
        )
    }
}
