import React, { useEffect, useState } from "react"
import {
    Col,
    Container,
    Input,
    InputGroup,
    InputGroupAddon,
    Label,
    ListGroup,
    ListGroupItem,
    Row
} from "reactstrap"
import MembershipService from "../api/services/membership"
import ClientName from "./ClientName"
import "./PrepaidCounters.css"

const PrepaidCounters = props => {
    function createPrepaidCntObjects() {
        let objects = {}
        if (props.memberships)
            props.memberships.forEach(
                membership => (objects[membership.id] = membership.prepaid_cnt)
            )
        return objects
    }

    const [prepaidCnts, setPrepaidCnts] = useState(() => createPrepaidCntObjects())

    useEffect(() => {
        createPrepaidCntObjects()
    }, [props.memberships])

    function onChange(e) {
        const target = e.target
        const value = Number(target.value)
        const id = Number(target.dataset.id)
        setPrepaidCnts(prevPrepaidCnts => {
            // vytvorime kopii prepaidCnts (ma jen jednu uroven -> staci melka kopie)
            const newPrepaidCnts = { ...prevPrepaidCnts }
            newPrepaidCnts[id] = value
            return newPrepaidCnts
        })
        const data = { id, prepaid_cnt: value }
        MembershipService.patch(data).then(props.funcRefreshPrepaidCnt(id, value))
    }

    function onFocus(e) {
        e.target.select()
    }

    return (
        <Container fluid>
            <Row className="justify-content-center">
                {props.memberships &&
                    props.memberships.map(membership => (
                        <Col sm="9" md="3" lg="2" xl="2" key={membership.id}>
                            <ListGroup>
                                <ListGroupItem>
                                    <h5>
                                        <ClientName client={membership.client} link />
                                    </h5>
                                    <InputGroup>
                                        <InputGroupAddon addonType="prepend">
                                            <Label
                                                className="input-group-text"
                                                for={"prepaid_cnt" + membership.id}>
                                                předplaceno
                                            </Label>
                                        </InputGroupAddon>
                                        <Input
                                            type="number"
                                            value={prepaidCnts[membership.id]}
                                            min="0"
                                            onChange={onChange}
                                            data-id={membership.id}
                                            onFocus={onFocus}
                                            id={"prepaid_cnt" + membership.id}
                                            className="PrepaidCountersInput"
                                        />
                                    </InputGroup>
                                </ListGroupItem>
                            </ListGroup>
                        </Col>
                    ))}
                {props.memberships && !Boolean(props.memberships.length) && (
                    <p className="text-muted text-center">Žádní účastníci</p>
                )}
            </Row>
        </Container>
    )
}

export default PrepaidCounters
