import React, {Component} from "react"
import {Input, Container, Row, Col, ListGroup, ListGroupItem, InputGroup, InputGroupAddon} from "reactstrap"
import ClientName from "./ClientName"
import MembershipService from "../api/services/membership"

export default class PrepaidCounters extends Component {
    constructor(props) {
        super(props)
        this.state = {
            prepaid_cnts: this.createPrepaidCntObjects()
        }
    }

    onChange = e => {
        const target = e.target
        const state = this.state
        const id = target.dataset.id
        state.prepaid_cnts[id] = target.value
        this.setState(state)
        const data = {id, prepaid_cnt: target.value}
        MembershipService.patch(data)
            .then(this.props.funcRefreshPrepaidCnt(id, target.value))
    }

    createPrepaidCntObjects() {
        let objects = {}
        if(this.props.memberships)
            this.props.memberships.forEach(membership =>
                objects[membership.id] = membership.prepaid_cnt)
        return objects
    }

    onFocus = e =>
        e.target.select()

    componentDidUpdate(prevProps) {
        if(this.props.memberships !== prevProps.memberships)
            this.createPrepaidCntObjects()
    }

    render() {
        const {prepaid_cnts} = this.state
        return (
            <Container fluid>
                <Row className="justify-content-center">
                {this.props.memberships && this.props.memberships.map(membership =>
                    <Col sm="9" md="3" lg="2" xl="2" key={membership.id}>
                        <ListGroup>
                            <ListGroupItem>
                                <h5><ClientName client={membership.client} link/></h5>
                                <InputGroup>
                                    <InputGroupAddon addonType="prepend">předplaceno</InputGroupAddon>
                                    <Input type="number" value={prepaid_cnts[membership.id]} min="0"
                                           onChange={this.onChange} data-id={membership.id} onFocus={this.onFocus}/>
                                </InputGroup>
                            </ListGroupItem>
                        </ListGroup>
                    </Col>)}
                </Row>
            </Container>
        )
    }
}
