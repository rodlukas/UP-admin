import * as React from "react"
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
import MembershipService from "../api/services/MembershipService"
import { TEXTS } from "../global/constants"
import { MembershipType } from "../types/models"
import ClientName from "./ClientName"
import "./PrepaidCounters.css"
import Tooltip from "./Tooltip"

type Props = {
    memberships: Array<MembershipType>
    funcRefreshPrepaidCnt: (
        id: MembershipType["id"],
        prepaidCnt: MembershipType["prepaid_cnt"]
    ) => void
    isGroupActive: boolean
}

type PrepaidCntObjectsType = {
    [key: number]: MembershipType["prepaid_cnt"]
}

/** Komponenta zobrazující počítadla předplacených lekcí pro členy skupiny. */
const PrepaidCounters: React.FC<Props> = props => {
    const createPrepaidCntObjects = React.useCallback(() => {
        const objects: PrepaidCntObjectsType = {}
        props.memberships.forEach(membership => (objects[membership.id] = membership.prepaid_cnt))
        return objects
    }, [props.memberships])

    const [prepaidCnts, setPrepaidCnts] = React.useState(() => createPrepaidCntObjects())

    React.useEffect(() => {
        setPrepaidCnts(createPrepaidCntObjects())
    }, [createPrepaidCntObjects])

    function onChange(e: React.ChangeEvent<HTMLInputElement>): void {
        const target = e.currentTarget
        const value = Number(target.value)
        const id = Number(target.dataset.id as string)
        setPrepaidCnts(prevPrepaidCnts => {
            // vytvorime kopii prepaidCnts (ma jen jednu uroven -> staci melka kopie)
            const newPrepaidCnts = { ...prevPrepaidCnts }
            newPrepaidCnts[id] = value
            return newPrepaidCnts
        })
        const data = { id, prepaid_cnt: value }
        MembershipService.patch(data).then(() => {
            props.funcRefreshPrepaidCnt(id, value)
        })
    }

    function onFocus(e: React.ChangeEvent<HTMLInputElement>): void {
        e.currentTarget.select()
    }

    return (
        <Container fluid>
            <Row className="justify-content-center">
                {props.memberships.map(membership => (
                    <Col sm="9" md="3" lg="2" xl="2" key={membership.id}>
                        <ListGroup>
                            <ListGroupItem>
                                <h5>
                                    <ClientName client={membership.client} link />{" "}
                                    {props.isGroupActive && !membership.client.active && (
                                        <Tooltip
                                            postfix={
                                                "PrepaidCounters_InactiveClientAlert_" +
                                                membership.client.id
                                            }
                                            text={TEXTS.WARNING_INACTIVE_CLIENT_GROUP}
                                            size="1x"
                                        />
                                    )}
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
                {props.memberships.length === 0 && (
                    <p className="text-muted text-center">Žádní účastníci</p>
                )}
            </Row>
        </Container>
    )
}

export default PrepaidCounters
