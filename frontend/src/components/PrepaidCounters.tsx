import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Container, Grid, Text, TextInput, Title, Tooltip } from "@mantine/core"
import { faSackDollar } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import classNames from "classnames"
import * as React from "react"

import { usePatchMembership } from "../api/hooks"
import { TEXTS } from "../global/constants"
import { MembershipType } from "../types/models"

import ClientName from "./ClientName"
import * as styles from "./PrepaidCounters.css"
import Tooltip2 from "./Tooltip"

type Props = {
    /** Pole se členstvími všech klientů. */
    memberships: MembershipType[]
    /** Skupina je aktivní (true). */
    isGroupActive: boolean
}

/**
 * Objekt držící počty předplacených lekcí jednotlivých klientů.
 * ID členství: počet předplacených lekcí.
 */
type PrepaidCntObjectsType = Record<number, MembershipType["prepaid_cnt"]>

/** Komponenta zobrazující počítadla předplacených lekcí pro členy skupiny. */
const PrepaidCounters: React.FC<Props> = (props) => {
    const patchMembership = usePatchMembership()

    const createPrepaidCntObjects = React.useCallback(() => {
        const objects: PrepaidCntObjectsType = {}
        props.memberships.forEach((membership) => (objects[membership.id] = membership.prepaid_cnt))
        return objects
    }, [props.memberships])

    const [prepaidCnts, setPrepaidCnts] = React.useState(() => createPrepaidCntObjects())

    React.useEffect(() => {
        setPrepaidCnts(createPrepaidCntObjects())
    }, [createPrepaidCntObjects])

    const onChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>): void => {
            const target = e.currentTarget
            const value = Number(target.value)
            const id = Number(target.dataset.id!)
            setPrepaidCnts((prevPrepaidCnts) => {
                const newPrepaidCnts = { ...prevPrepaidCnts }
                newPrepaidCnts[id] = value
                return newPrepaidCnts
            })
            const data = { id, prepaid_cnt: value }
            patchMembership.mutate(data)
        },
        [patchMembership],
    )

    function onFocus(e: React.ChangeEvent<HTMLInputElement>): void {
        e.currentTarget.select()
    }

    return (
        <Container fluid>
            <Grid justify="center">
                {props.memberships.map((membership) => (
                    <Grid.Col
                        span={{ base: 12, sm: 9, md: 3, lg: 3, xl: 2 }}
                        key={membership.id}>
                        <div className={styles.memberCard}>
                            <Title order={5} className={styles.memberHeading}>
                                <ClientName client={membership.client} link />{" "}
                                {props.isGroupActive && !membership.client.active && (
                                    <Tooltip2
                                        text={TEXTS.WARNING_INACTIVE_CLIENT_GROUP}
                                        size="1x"
                                    />
                                )}
                            </Title>
                            <Tooltip label="Počet předplacených lekcí">
                                <TextInput
                                    type="number"
                                    id={`prepaid_cnt${membership.id}`}
                                    value={prepaidCnts[membership.id]}
                                    min={0}
                                    onChange={onChange}
                                    data-id={membership.id}
                                    onFocus={onFocus}
                                    className={styles.prepaidCountersInput}
                                    leftSectionProps={{
                                        className: classNames({
                                            [styles.prepaidCountersInputGroupLabel]:
                                                prepaidCnts[membership.id] > 0,
                                        }),
                                    }}
                                    leftSection={
                                        <label htmlFor={`prepaid_cnt${membership.id}`}>
                                            <FontAwesomeIcon icon={faSackDollar} fixedWidth />
                                        </label>
                                    }
                                />
                            </Tooltip>
                        </div>
                    </Grid.Col>
                ))}
                {props.memberships.length === 0 && (
                    <Text c="dimmed" ta="center">Žádní účastníci</Text>
                )}
            </Grid>
        </Container>
    )
}

export default PrepaidCounters
