import React, {Component} from "react"
import {Route, NavLink as RouterNavLink, BrowserRouter} from "react-router-dom"
import Clients from "./lists/Clients"
import Card from "./lists/Card"
import Diary from "./days/Diary"
import Groups from "./lists/Groups"
import Dashboard from "./days/Dashboard"
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
            <BrowserRouter>
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
                        <Route exact path="/skupiny" component={Groups}/>
                        <Route path="/diar" component={Diary}/>
                        <Route exact path="/klienti" component={Clients}/>
                        <Route path="/klienti/:id" component={Card}/>
                        <Route path="/skupiny/:id" component={Card}/>
                    </div>
                </div>
            </BrowserRouter>
        )
    }
}
