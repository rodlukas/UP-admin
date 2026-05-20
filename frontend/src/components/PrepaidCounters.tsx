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
    // Posledni server-potvrzena hodnota (aktualizuje se pouze v onSuccess).
    const serverPrepaidCntsRef = React.useRef<PrepaidCntObjectsType>(createPrepaidCntObjects())
    // ID polozek, ktere uzivatel rozepsal (mezi onChange a uspesnym PATCH) — externi refetch
    // jejich hodnotu neprepise (jinak by uzivatel prisel o rozepsany text).
    const dirtyIdsRef = React.useRef<Set<number>>(new Set())
    // Hodnoty, ktere jsou prave v letu na server (mezi mutate a settled). Deduplikujou se,
    // takze rapid blur/refocus se stejnou hodnotou nevypustí druhy PATCH; a refetch ji
    // pri merge nesmaze.
    const inFlightRef = React.useRef<PrepaidCntObjectsType>({})

    React.useEffect(() => {
        const fresh = createPrepaidCntObjects()
        // Garbage-collect dirty/in-flight IDs, ktere uz nejsou ve fresh memberships
        // (smazane / vymenene), at se neukotvi cizi data v ref/state.
        for (const id of Array.from(dirtyIdsRef.current)) {
            if (!(id in fresh)) {
                dirtyIdsRef.current.delete(id)
            }
        }
        for (const id of Object.keys(inFlightRef.current).map(Number)) {
            if (!(id in fresh)) {
                delete inFlightRef.current[id]
            }
        }
        // serverRef si drzi server-potvrzenou hodnotu kazdeho ID; pro in-flight nebo dirty
        // nechame puvodne potvrzenou hodnotu (jinak by se ztratil "previous" pro revert).
        const nextServer: PrepaidCntObjectsType = {}
        for (const id of Object.keys(fresh).map(Number)) {
            if (id in inFlightRef.current || dirtyIdsRef.current.has(id)) {
                // refetch zachytil stary server state, ale my mame novejsi (in-flight nebo dirty);
                // ponech predchozi server snapshot, fresh hodnota nas zajimat nesmi.
                nextServer[id] = serverPrepaidCntsRef.current[id] ?? fresh[id]
            } else {
                nextServer[id] = fresh[id]
            }
        }
        serverPrepaidCntsRef.current = nextServer
        setPrepaidCnts((prev) => {
            const merged: PrepaidCntObjectsType = { ...fresh }
            // pro dirty / in-flight polozky zachovej rozpracovanou uzivatelskou hodnotu
            for (const id of dirtyIdsRef.current) {
                if (id in prev) {
                    merged[id] = prev[id]
                }
            }
            for (const id of Object.keys(inFlightRef.current).map(Number)) {
                if (id in prev) {
                    merged[id] = prev[id]
                }
            }
            return merged
        })
    }, [createPrepaidCntObjects])

    const onChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>): void => {
            const target = e.currentTarget
            const value = Number(target.value)
            const id = Number(target.dataset.id)
            dirtyIdsRef.current.add(id)
            setPrepaidCnts((prevPrepaidCnts) => {
                const newPrepaidCnts = { ...prevPrepaidCnts }
                newPrepaidCnts[id] = value
                return newPrepaidCnts
            })
        },
        [],
    )

    // Commit hodnotu na server az pri blur, ne pri kazdem keystroke.
    // serverPrepaidCntsRef se aktualizuje az v onSuccess (drzi server-potvrzenou hodnotu).
    // inFlightRef se aktualizuje pred mutate a maze v onSettled (drzi prave odesilanou hodnotu)
    // → rapid blur/refocus se stejnou hodnotou nepustí duplicitni PATCH a refetch ji nesmaze.
    const onBlur = React.useCallback(
        (e: React.FocusEvent<HTMLInputElement>): void => {
            const target = e.currentTarget
            const value = Number(target.value)
            const id = Number(target.dataset.id)
            const serverValue = serverPrepaidCntsRef.current[id]
            const inFlightValue = inFlightRef.current[id]
            const effectiveValue = inFlightValue ?? serverValue
            if (effectiveValue === value) {
                // bud se hodnota nezmenila, nebo uz je presne tato hodnota odeslana → ne-op
                dirtyIdsRef.current.delete(id)
                return
            }
            inFlightRef.current[id] = value
            patchMembership.mutate(
                { id, prepaid_cnt: value },
                {
                    onSuccess: () => {
                        // Pokud uz je v letu novejsi PATCH (uzivatel mezitim zmenil hodnotu
                        // a znovu blurnul), necham vsechno na ten novejsi mutate – jinak by
                        // out-of-order odpoved tohoto PATCHe stale prepsala serverRef i dirty.
                        if (inFlightRef.current[id] !== value) {
                            return
                        }
                        serverPrepaidCntsRef.current = {
                            ...serverPrepaidCntsRef.current,
                            [id]: value,
                        }
                        dirtyIdsRef.current.delete(id)
                        delete inFlightRef.current[id]
                    },
                    onError: () => {
                        // Stejna ochrana: pokud uz je v letu novejsi PATCH, nech mu drzet inFlight.
                        if (inFlightRef.current[id] === value) {
                            delete inFlightRef.current[id]
                        }
                        // dirty zustava → efekt na refetchi UI neprepise a retry projde
                    },
                },
            )
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
                                    onBlur={onBlur}
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
