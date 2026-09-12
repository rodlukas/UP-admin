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
 * Stav jednoho počítadla — DVĚ nezávislá fakta, ne sada příznaků.
 *
 * Dřív to byla čtveřice `value`/`dirtyRef`/`serverValueRef`/`inFlightRef`, kde tři z nich
 * popisovaly totéž jinak; prakticky každá chyba v téhle komponentě byla dvojice, která se
 * rozešla (dirty zůstalo viset pod uloženou hodnotou, `serverValueRef` tvrdil starou hodnotu
 * po zahozené odpovědi…). Tady je každé pole jiná otázka a odvozuje se z nich všechno ostatní
 * (co zobrazit, jestli je co ukládat, jestli má smysl posílat PATCH), takže se nemají jak
 * rozejít.
 */
type EditState = {
    /** Co pole drží lokálně; `null` = zobrazuje se to, co říkají props (tj. server). */
    draft: number | null
    /** Poslední odeslaný PATCH a jak dopadl; `null` = od načtení jsme neodeslali nic. */
    sent: { value: number; status: "pending" | "ok" | "failed" } | null
}

const INITIAL_EDIT: EditState = { draft: null, sent: null }

/** Hodnota v poli. */
const displayedValue = (state: EditState, fromProps: number): number => state.draft ?? fromProps

/**
 * Hodnota, o které VÍME, že ji server má. `undefined` = nevíme — po selhání není jisté,
 * jestli se ztratil požadavek, nebo až odpověď, a odeslaný PATCH taky ještě potvrzený není.
 */
const confirmedValue = (state: EditState, fromProps: number): number | undefined => {
    if (state.sent === null) {
        return fromProps
    }
    return state.sent.status === "ok" ? state.sent.value : undefined
}

/**
 * Hodnota, kterou server má nebo bude mít, až doběhne odeslaný PATCH — na rozdíl od
 * `confirmedValue` počítá i s tím, co je právě v letu. `undefined` = nevíme, takže se radši
 * pošle znovu: zbytečný PATCH je levnější než tiše zahozený zápis.
 */
const settledValue = (state: EditState, fromProps: number): number | undefined => {
    if (state.sent === null) {
        return fromProps
    }
    return state.sent.status === "failed" ? undefined : state.sent.value
}

/**
 * Stav po zapsání `next` do pole.
 *
 * `draft: null` (= „pole zase sleduje props") jen když je `next` zároveň potvrzená hodnota
 * A props ji už znají: návrat na to, co server má, není editace a nesmí se tvářit jako
 * neuložená změna. Dokud props potvrzenou hodnotu nedohnaly, musí `draft` zůstat, jinak by
 * pole skočilo na zastaralou hodnotu z props.
 */
const withDraft = (state: EditState, next: number, fromProps: number): EditState => ({
    ...state,
    draft: next === fromProps && next === confirmedValue(state, fromProps) ? null : next,
})

/** Zobrazená hodnota není potvrzená serverem — rozepsaná, odeslaná nebo neúspěšně odeslaná. */
const isUnsaved = (state: EditState, fromProps: number): boolean =>
    displayedValue(state, fromProps) !== confirmedValue(state, fromProps)

/**
 * Ořízne rozepsanou hodnotu na to, co server přijme (`prepaid_cnt` je `PositiveIntegerField`).
 *
 * `NumberInput` sám o sobě kladnou celočíselnost nehlídá: `min={0}` řeší jen vlastní +/−
 * tlačítka a klávesové šipky (napsat `-3` jde dál) a `allowDecimal={false}` jen psaní
 * (hodnota v poli se tím ale nestává platnou — `""` je pořád možné). Bez obalujícího
 * `<form>` (commit je na blur, ne na submit) navíc nativní HTML constraint validace nikdy
 * neproběhne, takže neplatná hodnota by došla až na server jako PATCH a skončila 400.
 *
 * Ořezává (`trunc`), nezaokrouhluje: stejně jako `allowDecimal={false}` na samotném inputu,
 * ať se záchranná brzda a vlastní obrana pole neshodnou na jiném výsledku. Zaokrouhlování
 * by navíc u `7.6` připsalo 8 předplacených lekcí — víc, než klient zaplatil.
 *
 * Musí ji projít KAŽDÁ cesta k `commit()` — tedy i flush při unmountu, kde žádný blur
 * neproběhne (viz efekt níž), ne jen `onBlur`.
 */
const clampPrepaidCnt = (rawValue: number): number =>
    Number.isFinite(rawValue) ? Math.max(0, Math.trunc(rawValue)) : 0

/**
 * Počítadlo předplacených lekcí jednoho člena skupiny.
 *
 * Vlastní `usePatchMembership()` instance na řádek — díky tomu nepotřebuje řešit, čí je
 * která hodnota (na rozdíl od sdílení jedné mutace napříč všemi členy): zmizelý/vyměněný
 * člen prostě unmountne i se svým stavem, žádný ruční úklid podle ID není potřeba. Instance
 * nese i `scope` (viz `usePatchMembership`), který PATCHe jednoho členství řadí za sebe —
 * dva naráz tedy nelétají a server je nemůže zpracovat v opačném pořadí, než v jakém odešly.
 *
 * `mutateAsync().then()/.catch()` místo per-call `onSuccess`/`onError`: TanStack Query v5
 * tyhle callbacky ukládá na instanci mutace, ne na konkrétní volání, takže při dvou rychlých
 * editacích téhož pole by callback druhého volání „ukradl" i vyřízení toho prvního. Promise
 * z `mutateAsync` se váže na konkrétní volání.
 */
const MembershipPrepaidInput: React.FC<RowProps> = ({ membership, isGroupActive }) => {
    const patchMembership = usePatchMembership(membership.id)

    const [edit, setEditState] = React.useState<EditState>(INITIAL_EDIT)
    /**
     * Synchronní zrcadlo `edit` pro čtení mimo render (`.then()` PATCHe, cleanup při
     * unmountu). Plnit ho z passive efektu nejde: ten React plánuje makrotaskem, kdežto
     * `.then()` je mikrotask, takže by četl stav před posledním stiskem klávesy. Je to
     * mechanická kopie JEDNOHO stavu, ne další zdroj pravdy.
     */
    const editRef = React.useRef(edit)
    const setEdit = React.useCallback((next: EditState): void => {
        editRef.current = next
        setEditState(next)
    }, [])

    const value = displayedValue(edit, membership.prepaid_cnt)

    React.useEffect(() => {
        // Props se ZMĚNILY (na stejnou hodnotu se efekt znovu nespustí), takže server řekl
        // něco nového. Lokální hodnotu drž dál jen tehdy, když je pořád opravdu neuložená —
        // jinak se pole zase napojí na server. Bez toho by po uložení zamrzlo natrvalo na
        // naší hodnotě.
        const at = editRef.current
        // Props dorazily přesně s tím, co držíme. Kromě „doběhl refetch po našem uložení" to
        // pokrývá i SELHANÝ PATCH, který server přesto přijal (ztratila se až odpověď):
        // `confirmedValue` je po selhání navždy `undefined`, takže bez téhle větve by pole
        // zůstalo „neuložené" napořád — bezdůvodně by blokovalo zavření tabu, ignorovalo
        // všechny další serverové změny a při unmountu ještě přepsalo novější serverovou
        // hodnotu tou svou.
        const propsCaughtUp = displayedValue(at, membership.prepaid_cnt) === membership.prepaid_cnt
        // Nebo je naše hodnota potvrzená a props nesou novější cizí změnu (jiná záložka,
        // dekrement po předplacené lekci) — ta má přednost.
        if (propsCaughtUp || !isUnsaved(at, membership.prepaid_cnt)) {
            setEdit(INITIAL_EDIT)
        }
    }, [membership.prepaid_cnt, setEdit])

    const commit = React.useCallback(
        (next: number): void => {
            const current = editRef.current
            if (next === settledValue(current, membership.prepaid_cnt)) {
                // server tuhle hodnotu má nebo bude mít → není co posílat
                return
            }
            setEdit({ draft: next, sent: { value: next, status: "pending" } })
            patchMembership
                .mutateAsync({ id: membership.id, prepaid_cnt: next })
                .then(() => {
                    // Guard: mezitím mohl odejít novější PATCH a ten výsledek tohohle
                    // (už překonaného) volání přebít nesmí. `draft` se nechává být — uživatel
                    // mohl mezitím psát dál a jeho rozepsanou hodnotu potvrzení nepřepisuje.
                    const at = editRef.current
                    if (at.sent?.status === "pending" && at.sent.value === next) {
                        setEdit({ ...at, sent: { value: next, status: "ok" } })
                    }
                })
                .catch(() => {
                    // chybovou notifikaci zobrazuje globální onError v queryClient
                    const at = editRef.current
                    if (at.sent?.status === "pending" && at.sent.value === next) {
                        setEdit({ ...at, sent: { value: next, status: "failed" } })
                    }
                })
        },
        [patchMembership, membership.id, membership.prepaid_cnt, setEdit],
    )

    // Pozn.: Number("") i Number("-") (rozepsany zapor bez cislice) davaji 0, resp. NaN —
    // obojí se tu rovnou mapuje na 0, dík select-on-focus (viz onFocus) uživatel typicky
    // přepisuje celou hodnotu, vědomě bez guardu.
    const onChange = React.useCallback(
        (val: number | string): void => {
            const numeric = Number(val)
            const next = Number.isNaN(numeric) ? 0 : numeric
            setEdit(withDraft(editRef.current, next, membership.prepaid_cnt))
        },
        [membership.prepaid_cnt, setEdit],
    )

    const onBlur = React.useCallback(
        (e: React.FocusEvent<HTMLInputElement>): void => {
            const clampedValue = clampPrepaidCnt(Number(e.currentTarget.value))
            // clamp musí být vidět i v poli, ne jen v odeslaném PATCHi — `commit()` nemusí
            // nic poslat (ne-op) a pole by pak zůstalo na neplatné hodnotě
            setEdit(withDraft(editRef.current, clampedValue, membership.prepaid_cnt))
            commit(clampedValue)
        },
        [commit, membership.prepaid_cnt, setEdit],
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
                // clamp i tady: krok nad rozepsanou hodnotou z ní desetinnou část neodstraní
                // (`allowDecimal={false}` níž ji sice do pole nepustí, ale `commit()` se na
                // nastavení inputu spoléhat nesmí)
                const clampedValue = clampPrepaidCnt(values.floatValue)
                setEdit(withDraft(editRef.current, clampedValue, membership.prepaid_cnt))
                commit(clampedValue)
            }
        },
        [commit, membership.prepaid_cnt, setEdit],
    )

    // Nejnovejsi `commit` pro flush pri unmountu — v refu, aby unmount efekt mohl mit prazdne
    // deps (jinak by se cleanup spoustel pri kazde zmene a PATCHoval uprostred psani).
    const commitRef = React.useRef(commit)
    const propsValueRef = React.useRef(membership.prepaid_cnt)
    React.useEffect(() => {
        commitRef.current = commit
        propsValueRef.current = membership.prepaid_cnt
    })

    // React unmount nevyvola blur — bez flushe by SPA navigace (zavreni karty skupiny apod.)
    // rozepsanou hodnotu tise zahodila. Mutace bezi v queryClient cache, unmount ji neprerusi.
    React.useEffect(
        () => (): void => {
            const last = editRef.current
            if (isUnsaved(last, propsValueRef.current)) {
                // `clampPrepaidCnt` i tady: unmount blur nevyvolá, takže bez něj by rozepsaná
                // neplatná hodnota (`-3`) šla na server rovnou a skončila 400 — s červenou
                // notifikací na stránce, kam uživatel zrovna odešel. `commit()` sám pozná,
                // že odeslaný-a-nepotvrzený PATCH se stejnou hodnotou posílat znovu nemá.
                commitRef.current(clampPrepaidCnt(displayedValue(last, propsValueRef.current)))
            }
        },
        [],
    )

    // Zavreni tabu / reload nevyvola blur ani unmount cleanup spolehlive — pri neulozene
    // zmene varuj nativnim dialogem (stejny vzor jako useModal).
    React.useEffect(() => {
        const beforeUnload = (e: BeforeUnloadEvent): void => {
            if (isUnsaved(editRef.current, propsValueRef.current)) {
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
                    // `prepaid_cnt` je na serveru PositiveIntegerField — desetinnou hodnotu
                    // nemá smysl nechat vůbec napsat. `clampPrepaidCnt` (viz výš) ji sice
                    // ořízne na každé cestě k `commit()`, ale to je záchranná brzda,
                    // ne očekávaná cesta.
                    allowDecimal={false}
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
