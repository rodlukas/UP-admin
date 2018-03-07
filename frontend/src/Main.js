import React, {Component} from "react"
import {Route, NavLink as RouterNavLink, HashRouter} from "react-router-dom"
import Clients from "./Clients"
import Diary from "./Diary"
import Groups from "./Groups"
import Dashboard from "./Dashboard"
import {Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink,} from 'reactstrap'

class Main extends Component {
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
                        <Route path="/klienti" component={Clients}/>
                        <Route path="/skupiny" component={Groups}/>
                        <Route path="/diar" component={Diary}/>
                    </div>
                </div>
            </HashRouter>
        )
    }
}

export default Main
