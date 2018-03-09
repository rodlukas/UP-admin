import React, {Component} from "react"
import {Route, NavLink as RouterNavLink, HashRouter} from "react-router-dom"
import ClientList from "./clients/ClientList"
import ClientView from "./clients/ClientView"
import ClientEdit from "./clients/ClientEdit"
import Diary from "./Diary"
import Groups from "./Groups"
import Dashboard from "./dashboard/Dashboard"
import {Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink,} from 'reactstrap'

export default class Main extends Component {
    constructor(props) {
        super(props)

        this.toggle = this.toggle.bind(this)
        this.state = {
            isOpen: false
        }
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    render() {
        return (
            <HashRouter>
                <div>
                    <Navbar color="faded" light expand="md">
                        <NavbarBrand href="/">UPadmin</NavbarBrand>
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
                        <Route path="/klienti" component={ClientList}/>
                        <Route path="/klienti/:clientId" component={ClientView}/>
                        <Route path="/klienti/:clientId/upravit" component={ClientEdit}/>
                        <Route path="/klienti/:clientId/pridat" component={ClientEdit}/>
                    </div>
                </div>
            </HashRouter>
        )
    }
}
