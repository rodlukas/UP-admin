import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Container, Grid, Text, TextInput, Title, Tooltip } from "@mantine/core"
import { faSackDollar } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import classNames from "classnames"
import * as React from "react"

import { usePatchMembership } from "../api/hooks"
import { TEXTS } from "../global/constants"
import { MembershipType } from "../types/models"

import ClientName from "./ClientName"
import InfoTooltip from "./InfoTooltip"
import * as styles from "./PrepaidCounters.css"

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

    // Pozn.: Number("") vrací 0, vymazané pole se tedy při bluru uloží jako 0 — díky
    // select-on-focus (viz onFocus) uživatel typicky přepisuje celou hodnotu, vědomě bez guardu.
    const onChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
        const target = e.currentTarget
        const value = Number(target.value)
        const id = Number(target.dataset.id)
        dirtyIdsRef.current.add(id)
        setPrepaidCnts((prevPrepaidCnts) => {
            const newPrepaidCnts = { ...prevPrepaidCnts }
            newPrepaidCnts[id] = value
            return newPrepaidCnts
        })
    }, [])

    // Commit hodnotu na server az pri blur, ne pri kazdem keystroke.
    // serverPrepaidCntsRef se aktualizuje az po uspechu (drzi server-potvrzenou hodnotu).
    // inFlightRef se aktualizuje pred odeslanim a maze po dobehnuti (drzi prave odesilanou
    // hodnotu) → rapid blur/refocus se stejnou hodnotou nepustí duplicitni PATCH a refetch
    // ji nesmaze.
    //
    // Zamerne mutateAsync + vlastni .then/.catch misto per-mutate onSuccess/onError:
    // TanStack Query v5 doruci per-mutate callbacky jen POSLEDNIMU mutate() na sdilene
    // useMutation instanci — pri soubehu ulozeni dvou ruznych clenu by cleanup prvniho
    // nikdy neprobehl (clen by zustal navzdy dirty a ignoroval dalsi refetche). Promise
    // z mutateAsync se vaze na konkretni mutaci a usadi se vzdy.
    const commit = React.useCallback(
        (id: number, value: number): void => {
            const serverValue = serverPrepaidCntsRef.current[id]
            const inFlightValue = inFlightRef.current[id]
            const effectiveValue = inFlightValue ?? serverValue
            if (effectiveValue === value) {
                // bud se hodnota nezmenila, nebo uz je presne tato hodnota odeslana → ne-op
                dirtyIdsRef.current.delete(id)
                return
            }
            inFlightRef.current[id] = value
            patchMembership
                .mutateAsync({ id, prepaid_cnt: value })
                .then(() => {
                    // Pokud uz je v letu novejsi PATCH (uzivatel mezitim zmenil hodnotu
                    // a znovu blurnul), necham vsechno na ten novejsi — jinak by
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
                })
                .catch(() => {
                    // Stejna ochrana: pokud uz je v letu novejsi PATCH, nech mu drzet inFlight.
                    if (inFlightRef.current[id] === value) {
                        delete inFlightRef.current[id]
                    }
                    // dirty zustava → efekt na refetchi UI neprepise a retry projde
                    // (chybovou notifikaci zobrazuje globalni onError v queryClient)
                })
        },
        [patchMembership],
    )

    const onBlur = React.useCallback(
        (e: React.FocusEvent<HTMLInputElement>): void => {
            const target = e.currentTarget
            commit(Number(target.dataset.id), Number(target.value))
        },
        [commit],
    )

    // Nejnovejsi hodnoty + commit pro flush pri unmountu — ulozene v ref, aby unmount
    // efekt mohl mit prazdne deps (jinak by se cleanup spoustel pri kazde zmene a PATCHoval
    // uprostred psani).
    const latestRef = React.useRef({ prepaidCnts, commit })
    React.useEffect(() => {
        latestRef.current = { prepaidCnts, commit }
    })

    // React unmount nevyvola blur — bez flushe by SPA navigace (zavreni karty skupiny apod.)
    // rozepsanou hodnotu tise zahodila. Mutace bezi v queryClient cache, unmount ji neprerusi.
    React.useEffect(
        () => (): void => {
            const latest = latestRef.current
            for (const id of Array.from(dirtyIdsRef.current)) {
                if (id in latest.prepaidCnts) {
                    latest.commit(id, latest.prepaidCnts[id])
                }
            }
        },
        [],
    )

    // Zavreni tabu / reload nevyvola blur ani unmount cleanup spolehlive — pri neulozene
    // zmene varuj nativnim dialogem (stejny vzor jako useModal).
    React.useEffect(() => {
        const beforeUnload = (e: BeforeUnloadEvent): void => {
            if (dirtyIdsRef.current.size > 0) {
                e.preventDefault()
                e.returnValue = ""
            }
        }
        globalThis.addEventListener("beforeunload", beforeUnload)
        return (): void => globalThis.removeEventListener("beforeunload", beforeUnload)
    }, [])

    function onFocus(e: React.ChangeEvent<HTMLInputElement>): void {
        e.currentTarget.select()
    }

    return (
        <Container fluid>
            <Grid justify="center">
                {props.memberships.map((membership) => (
                    <Grid.Col span={{ base: 12, sm: 9, md: 3, lg: 3, xl: 2 }} key={membership.id}>
                        <div className={styles.memberCard}>
                            <Title order={5} className={styles.memberHeading}>
                                <ClientName client={membership.client} link />{" "}
                                {props.isGroupActive && !membership.client.active && (
                                    <InfoTooltip
                                        text={TEXTS.WARNING_INACTIVE_CLIENT_GROUP}
                                        size="1x"
                                    />
                                )}
                            </Title>
                            {/* focus: obsah tooltipu musí být dosažitelný i z klávesnice (WCAG 1.4.13) */}
                            <Tooltip
                                label="Počet předplacených lekcí"
                                events={{ hover: true, focus: true, touch: true }}>
                                <TextInput
                                    type="number"
                                    aria-label="Počet předplacených lekcí"
                                    id={`prepaid_cnt${membership.id}`}
                                    // fallback na membership: nove cleny z refetche stav jeste
                                    // nezna (sync efekt bezi az po renderu) — bez fallbacku by
                                    // input byl prvni render uncontrolled (value=undefined)
                                    value={prepaidCnts[membership.id] ?? membership.prepaid_cnt}
                                    min={0}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    data-id={membership.id}
                                    onFocus={onFocus}
                                    className={styles.prepaidCountersInput}
                                    leftSectionProps={{
                                        className: classNames({
                                            [styles.prepaidCountersInputGroupLabel]:
                                                (prepaidCnts[membership.id] ??
                                                    membership.prepaid_cnt) > 0,
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
                    <Text c="dimmed" ta="center">
                        Žádní účastníci
                    </Text>
                )}
            </Grid>
        </Container>
    )
}

export default PrepaidCounters
