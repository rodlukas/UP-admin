import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Container, Grid, NumberInput, Text, Title, Tooltip } from "@mantine/core"
import { faSackDollar } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import classNames from "classnames"
import * as React from "react"

import { usePatchMembership } from "../api/hooks"
import { TEXTS } from "../global/constants"
import { MembershipType } from "../types/models"

import ClientName from "./ClientName"
import InfoTooltip from "./InfoTooltip"
import * as styles from "./PrepaidCounters.css"

type RowProps = {
    /** Členství jednoho klienta ve skupině. */
    membership: MembershipType
    /** Skupina je aktivní (true). */
    isGroupActive: boolean
}

/**
 * Počítadlo předplacených lekcí jednoho člena skupiny. Vlastní `usePatchMembership()`
 * instance na řádek — díky tomu nepotřebuje řešit, čí je která hodnota (na rozdíl od
 * sdílení jedné mutace napříč všemi členy): zmizelý/vyměněný člen prostě unmountne
 * i se svým stavem, žádný ruční úklid podle ID není potřeba.
 *
 * `mutateAsync().then()/.catch()` místo per-call `onSuccess`/`onError` je pořád nutné
 * i v rámci jednoho řádku: TanStack Query v5 tyhle callbacky ukládá na instanci mutace,
 * ne na konkrétní volání, takže při dvou rychlých editacích téhož pole (uloženo, pak
 * hned přepsáno znovu) by callback druhého volání "ukradl" i vyřízení toho prvního.
 * Promise z `mutateAsync` se naproti tomu váže na konkrétní volání a usadí se vždy
 * pro to svoje.
 */
const MembershipPrepaidInput: React.FC<RowProps> = ({ membership, isGroupActive }) => {
    const patchMembership = usePatchMembership()

    const [value, setValue] = React.useState(membership.prepaid_cnt)
    // Server-potvrzena hodnota (aktualizuje se pouze po uspesnem PATCHi, ktery jeste
    // nikdo novejsi nepredbehl).
    const serverValueRef = React.useRef(membership.prepaid_cnt)
    // Rozepsano mezi onChange a uspesnym PATCHem — externi refetch pak hodnotu nesmi prepsat.
    const dirtyRef = React.useRef(false)
    // Hodnota prave v letu na server (mezi mutate a settled), nebo undefined. Deduplikuje
    // rapid blur/refocus se stejnou hodnotou a rika `.then()` nize, jestli mezitim
    // neprisla novejsi editace, kterou by stara odpoved prepsala.
    const inFlightRef = React.useRef<number | undefined>(undefined)

    React.useEffect(() => {
        // Dokud je pole rozepsane nebo ma PATCH v letu, fresh hodnotu z props ignoruj —
        // jinak by refetch prepsal neulozenou editaci.
        if (dirtyRef.current || inFlightRef.current !== undefined) {
            return
        }
        serverValueRef.current = membership.prepaid_cnt
        setValue(membership.prepaid_cnt)
    }, [membership.prepaid_cnt])

    // Pozn.: Number("") i Number("-") (rozepsany zapor bez cislice) davaji 0, resp. NaN —
    // obojí se tu rovnou mapuje na 0, dík select-on-focus (viz onFocus) uživatel typicky
    // přepisuje celou hodnotu, vědomě bez guardu.
    const onChange = React.useCallback((val: number | string): void => {
        dirtyRef.current = true
        const numeric = Number(val)
        setValue(Number.isNaN(numeric) ? 0 : numeric)
    }, [])

    const commit = React.useCallback(
        (next: number): void => {
            const effectiveValue = inFlightRef.current ?? serverValueRef.current
            if (effectiveValue === next) {
                // bud se hodnota nezmenila, nebo uz je presne tato hodnota odeslana → ne-op
                dirtyRef.current = false
                return
            }
            inFlightRef.current = next
            patchMembership
                .mutateAsync({ id: membership.id, prepaid_cnt: next })
                .then(() => {
                    // Pokud uz je v letu novejsi PATCH (uzivatel mezitim zmenil hodnotu
                    // a znovu blurnul), necham vsechno na ten novejsi — jinak by
                    // out-of-order odpoved tohoto PATCHe stale prepsala serverRef i dirty.
                    if (inFlightRef.current !== next) {
                        return
                    }
                    serverValueRef.current = next
                    dirtyRef.current = false
                    inFlightRef.current = undefined
                })
                .catch(() => {
                    // Stejna ochrana: pokud uz je v letu novejsi PATCH, nech mu drzet inFlight.
                    if (inFlightRef.current === next) {
                        inFlightRef.current = undefined
                    }
                    // dirty zustava → efekt na refetchi UI neprepise a retry projde
                    // (chybovou notifikaci zobrazuje globalni onError v queryClient)
                })
        },
        [patchMembership, membership.id],
    )

    const onBlur = React.useCallback(
        (e: React.FocusEvent<HTMLInputElement>): void => {
            const rawValue = Number(e.currentTarget.value)
            // `NumberInput` sam o sobe kladnou celociselnost nehlida (min={0} resi jen
            // vlastni +/- tlacitka a klavesove sipky, desetinna cisla defaultne povoluje) —
            // bez obalujiciho <form> (commit je na blur, ne na submit) nativni HTML
            // constraint validace nikdy neprobehne, takze neplatna hodnota (napr. prazdne
            // pole -> "") by jinak dosla az na server jako PATCH a skoncila 400
            // (`prepaid_cnt` je `PositiveIntegerField`) — a kvuli dirty-tracking vyse by
            // tahle neplatna hodnota zustala natrvalo zaseknuta v UI, protoze zadny refetch
            // by ji uz neprepsal. Orizni na platnou hodnotu hned tady, at uzivatel vidi
            // opravenou hodnotu misto cervene notifikace.
            const clampedValue = Number.isFinite(rawValue) ? Math.max(0, Math.round(rawValue)) : 0
            if (clampedValue !== rawValue) {
                setValue(clampedValue)
            }
            commit(clampedValue)
        },
        [commit],
    )

    // `NumberInput` drzi focus v poli i po kliknuti na +/- (viz jeho `onPointerDown` +
    // `event.preventDefault()`), takze po nich blur nikdy neprijde — bez tohohle by krok
    // tlacitkem (i sipkou nahoru/dolu, jde stejnou cestou) zmenil zobrazenou hodnotu, ale
    // needal se ulozit, dokud uzivatel pole neopusti. `source` rozlisuje krok od psani/vlozeni
    // (to porad ceka na blur/Enter, jinak by se PATCHovalo za kazdy stisk klavesy).
    const onValueChange = React.useCallback(
        (values: { floatValue: number | undefined }, { source }: { source: string }): void => {
            if (source !== "increment" && source !== "decrement") {
                return
            }
            if (values.floatValue !== undefined) {
                commit(values.floatValue)
            }
        },
        [commit],
    )

    // Nejnovejsi hodnota + commit pro flush pri unmountu — ulozene v ref, aby unmount
    // efekt mohl mit prazdne deps (jinak by se cleanup spoustel pri kazde zmene a PATCHoval
    // uprostred psani).
    const latestRef = React.useRef({ value, commit })
    React.useEffect(() => {
        latestRef.current = { value, commit }
    })

    // React unmount nevyvola blur — bez flushe by SPA navigace (zavreni karty skupiny apod.)
    // rozepsanou hodnotu tise zahodila. Mutace bezi v queryClient cache, unmount ji neprerusi.
    React.useEffect(
        () => (): void => {
            if (dirtyRef.current) {
                latestRef.current.commit(latestRef.current.value)
            }
        },
        [],
    )

    // Zavreni tabu / reload nevyvola blur ani unmount cleanup spolehlive — pri neulozene
    // zmene varuj nativnim dialogem (stejny vzor jako useModal).
    React.useEffect(() => {
        const beforeUnload = (e: BeforeUnloadEvent): void => {
            if (dirtyRef.current) {
                e.preventDefault()
            }
        }
        globalThis.addEventListener("beforeunload", beforeUnload)
        return (): void => globalThis.removeEventListener("beforeunload", beforeUnload)
    }, [])

    function onFocus(e: React.ChangeEvent<HTMLInputElement>): void {
        e.currentTarget.select()
    }

    // Commit je jen na blur (viz vyse) — bez obalujiciho <form> by Enter jinak neudelal
    // nic a uzivatel by nemel zadny zpusob, jak ulozit bez kliknuti/tabu mimo pole.
    // Blur spusti existujici onBlur handler (vcetne clampu a globalni "Ulozeno" notifikace).
    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
        if (e.key === "Enter") {
            e.currentTarget.blur()
        }
    }

    return (
        <div className={styles.memberCard}>
            {/* order/size odděleně (viz `memberHeading`, který si font-size řídí sám) —
                sémanticky h2: PrepaidCounters se používá jen na kartě skupiny, přímo pod
                h1 jménem skupiny, žádná mezilehlá úroveň nadpisu tam není */}
            <Title order={2} className={styles.memberHeading}>
                <ClientName client={membership.client} link />{" "}
                {isGroupActive && !membership.client.active && (
                    <InfoTooltip text={TEXTS.WARNING_INACTIVE_CLIENT_GROUP} size="1x" />
                )}
            </Title>
            <Tooltip label="Počet předplacených lekcí">
                <NumberInput
                    aria-label="Počet předplacených lekcí"
                    id={`prepaid_cnt${membership.id}`}
                    value={value}
                    min={0}
                    onChange={onChange}
                    onValueChange={onValueChange}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    onKeyDown={onKeyDown}
                    className={styles.prepaidCountersInput}
                    leftSectionProps={{
                        className: classNames({
                            [styles.prepaidCountersInputGroupLabel]: value > 0,
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
    )
}

type Props = {
    /** Pole se členstvími všech klientů. */
    memberships: MembershipType[]
    /** Skupina je aktivní (true). */
    isGroupActive: boolean
}

/** Komponenta zobrazující počítadla předplacených lekcí pro členy skupiny. */
const PrepaidCounters: React.FC<Props> = ({ memberships, isGroupActive }) => (
    <Container fluid>
        <Grid justify="center">
            {memberships.map((membership) => (
                <Grid.Col span={{ base: 12, sm: 9, md: 3, lg: 3, xl: 2 }} key={membership.id}>
                    <MembershipPrepaidInput membership={membership} isGroupActive={isGroupActive} />
                </Grid.Col>
            ))}
            {memberships.length === 0 && (
                <Text c="dimmed" ta="center">
                    Žádní účastníci
                </Text>
            )}
        </Grid>
    </Container>
)

export default PrepaidCounters
