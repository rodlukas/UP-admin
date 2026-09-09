import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Alert, Container, Group, SimpleGrid, Skeleton } from "@mantine/core"
import { faSyncAlt } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import classNames from "classnames"
import * as React from "react"

import { mb1 } from "../global/utility.css"

import CustomButton from "./buttons/CustomButton"
import * as styles from "./Skeletons.css"

/**
 * Kostry načítání. Kostra drží rozvržení obsahu, který se teprve načítá, takže obsah po
 * dotažení dat nenaskočí do prázdna a čekání působí kratší.
 *
 * `data-qa="loading"` je kontrakt s E2E kroky (`wait_loading_cycle` a `wait_loading_ends`
 * v tests/ui_steps/helpers.py čekají na objevení a zmizení indikátoru) — drží ho `SkeletonShell`,
 * takže ho má každá kostra.
 */

/** Po této době načítání nejspíš narazilo na chybu a nabízí se znovunačtení stránky. */
const OVERLONG_LOADING_THRESHOLD = 25 // sekundy

/** Pole s daným počtem prvků pro opakované kostry (`key` je index, pořadí je stálé). */
const range = (count: number): number[] => Array.from({ length: count }, (_, index) => index)

type CountProps = {
    /** Kolik kostrových položek vykreslit. */
    count?: number
}

/**
 * Registr právě vykreslených obalů kostry.
 *
 * Kostra bývá na stránce i vícekrát — diář má sloupec na každý den týdne, přehled ukazuje
 * dnešní lekce vedle nejbližších. Upozornění na dlouhé načítání a `aria-live` oblast ale
 * smí být na stránce **jedna**: pět totožných hlášení „načítání trvá příliš dlouho" s pěti
 * tlačítky a pět souběžně předčítaných oblastí je šum, ne informace. Hlášení proto nese
 * vždy jen obal, který se přihlásil první; ostatní vykreslí čistý tvar kostry.
 *
 * `data-qa="loading"` má naopak **každý** obal: `wait_loading_ends`
 * v tests/ui_steps/helpers.py čeká, dokud nezmizí všechny výskyty, takže vynechat ho
 * u ostatních obalů by testům dovolilo pokračovat nad sloupcem, který se ještě načítá.
 */
let nextShellId = 0
const mountedShells = new Set<number>()
const shellListeners = new Set<() => void>()

const subscribeShells = (listener: () => void): (() => void) => {
    shellListeners.add(listener)
    return (): void => {
        shellListeners.delete(listener)
    }
}

const notifyShells = (): void => {
    shellListeners.forEach((listener) => listener())
}

/** Nese tenhle obal upozornění na dlouhé načítání a `aria-live` oblast? */
const useIsPrimaryShell = (id: number): boolean => {
    const isPrimary = React.useSyncExternalStore(subscribeShells, () =>
        mountedShells.size > 0 && Math.min(...mountedShells) === id,
    )

    React.useEffect(() => {
        mountedShells.add(id)
        notifyShells()
        return (): void => {
            mountedShells.delete(id)
            notifyShells()
        }
    }, [id])

    return isPrimary
}

/**
 * Společný obal kostry: nese `data-qa` a ARIA pro čtečky a po delší době přidá upozornění
 * s možností načíst stránku znovu. Bez téhle pojistky vypadá nekonečně animovaná kostra
 * stejně jako kostra u rozbitého požadavku.
 */
export const SkeletonShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOverlong, setIsOverlong] = React.useState(false)
    const idRef = React.useRef<number>(undefined)
    idRef.current ??= nextShellId++
    const isPrimary = useIsPrimaryShell(idRef.current)

    React.useEffect(() => {
        if (!isPrimary) {
            return
        }
        const timeoutId = globalThis.setTimeout(
            () => setIsOverlong(true),
            OVERLONG_LOADING_THRESHOLD * 1000,
        )
        return (): void => globalThis.clearTimeout(timeoutId)
    }, [isPrimary])

    const Wrapper: "output" | "div" = isPrimary ? "output" : "div"

    return (
        <Wrapper data-qa="loading" aria-live={isPrimary ? "polite" : undefined} aria-busy="true">
            {children}
            {isOverlong && isPrimary && (
                <Alert color="yellow" mt="md">
                    <p>
                        ⚠ Načítání trvá příliš dlouho, mohlo dojít k chybě. Zkuste stránku načíst
                        znovu.
                    </p>
                    <CustomButton
                        content={
                            <>
                                <FontAwesomeIcon icon={faSyncAlt} transform="left-2" /> Načíst
                                stránku znovu
                            </>
                        }
                        onClick={(): void => {
                            globalThis.location?.reload()
                        }}
                    />
                </Alert>
            )}
        </Wrapper>
    )
}

/**
 * Kostra hlavičky stránky — nadpis vlevo, akce vpravo. Rozměry i odsazení kopírují
 * `Heading`, aby se při dotažení dat nadpis nikam neposunul.
 */
export const HeadingSkeleton: React.FC = () => (
    <Group justify="space-between" align="center" mt="md" mb="lg" gap="sm">
        <Skeleton h={34} radius="sm" w="30%" />
        <Skeleton h={36} radius="sm" w={160} />
    </Group>
)

/**
 * Kostra ohraničeného panelu s řádky — tvar, který má většina obsahu v aplikaci
 * (tabulka klientů, seznam zájemců, sloupec nastavení).
 */
export const PanelSkeleton: React.FC<CountProps> = ({ count = 5 }) => (
    <div className={styles.panel}>
        <Skeleton h={24} mb="md" radius="sm" w="40%" />
        {range(count).map((index) => (
            <div key={index} className={styles.row}>
                <Skeleton h={18} mb="sm" radius="sm" w="55%" />
                <Skeleton h={18} mb="sm" radius="sm" w="20%" />
            </div>
        ))}
    </div>
)

type StatCardSkeletonProps = CountProps & {
    /** Řádek poznámky pod titulkem, jako `EntityStatCard`'s `note` (ne každá karta ho má). */
    withNote?: boolean
}

/**
 * Kostra dlaždice s číslem (Statistiky). Kopíruje `statCard`: popisek, volitelnou poznámku,
 * velké číslo, slovo „celkem" a pod ním rozpad na řádky.
 */
export const StatCardSkeleton: React.FC<StatCardSkeletonProps> = ({
    count = 3,
    withNote = false,
}) => (
    <div className={styles.panel}>
        <Skeleton h={18} mb="sm" radius="sm" w="35%" />
        {withNote && (
            <>
                <Skeleton h={14} mb="xs" radius="sm" />
                <Skeleton h={14} mb="sm" radius="sm" w="70%" />
            </>
        )}
        <Skeleton h={44} mb="xs" radius="sm" w="45%" />
        <Skeleton h={14} mb="md" radius="sm" w="20%" />
        {range(count).map((index) => (
            <div key={index} className={styles.row}>
                <Skeleton h={14} mb="xs" radius="sm" w="40%" />
                <Skeleton h={14} mb="xs" radius="sm" w="15%" />
            </div>
        ))}
    </div>
)

type ChartSkeletonProps = {
    height?: number
    /** Placeholder přepínače metriky (`MetricToggle`) vedle nadpisu — jen sekce, které ho mají. */
    withToggle?: boolean
    /** Popisek pod nadpisem — jen sekce, které ho reálně mají. */
    withCaption?: boolean
}

/**
 * Kostra sekce s grafem — nadpis (s volitelným přepínačem metriky vedle), volitelný popisek
 * a plocha grafu. Rozpad na tyhle části je podstatný: jeden obdélník přes celou šířku
 * neřekne, že se načítá graf, ani kde skončí jeho titulek.
 */
export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({
    height = 260,
    withToggle = false,
    withCaption = false,
}) => (
    <div className={classNames(styles.panel, mb1)}>
        <div className={styles.chartSkeletonHeader}>
            <Skeleton h={22} radius="sm" w="30%" />
            {withToggle && <Skeleton h={30} radius="sm" w={140} />}
        </div>
        {withCaption && <Skeleton h={14} mb="md" mt="xs" radius="sm" w="55%" />}
        <Skeleton
            className={styles.chartArea}
            h={height}
            mt={withCaption ? 0 : "md"}
            radius="sm"
        />
    </div>
)

/**
 * Kostra žebříčku aktivity (`TopRankingSection`) — nadpis a pod ním tabulka # / jméno / počet lekcí.
 */
export const RankingTableSkeleton: React.FC<CountProps> = ({ count = 5 }) => (
    <div className={classNames(styles.panel, mb1)}>
        <Skeleton h={22} mb="sm" radius="sm" w="45%" />
        {range(count).map((index) => (
            <div key={index} className={styles.row}>
                <Skeleton h={16} radius="sm" w="8%" />
                <Skeleton h={16} radius="sm" w="55%" />
                <Skeleton h={16} radius="sm" w="15%" />
            </div>
        ))}
    </div>
)

/**
 * Kostra celé stránky — než se donačte kód route (Suspense) nebo její data.
 *
 * `Container` je podstatný: bez něj kostra ležela přes celou šířku plochy, tedy nalepená
 * na pruh navigace a přetékající za pravý okraj, kdežto skutečné stránky svůj obsah do
 * `Container` balí. Kostra pak neodpovídala tomu, co po ní přišlo.
 */
export const PageSkeleton: React.FC = () => (
    <Container>
        <SkeletonShell>
            <HeadingSkeleton />
            <PanelSkeleton count={6} />
        </SkeletonShell>
    </Container>
)

/**
 * Kostra seznamu s lištou nad tabulkou (Klienti, Skupiny).
 *
 * Lišta v kostře chybět nesmí: bez ní se po dotažení dat celá tabulka posune dolů o její
 * výšku, protože hledání a přepínač aktivních patří k tabulce, ne k nadpisu stránky.
 */
export const TableSkeleton: React.FC<CountProps> = ({ count = 8 }) => (
    <>
        <Group justify="space-between" align="center" mb="sm" gap="sm" wrap="nowrap">
            <Skeleton h={36} radius="sm" w="45%" />
            <Skeleton h={36} radius="sm" w={190} />
        </Group>
        <div className={styles.panel}>
            {range(count).map((index) => (
                <div key={index} className={styles.row}>
                    <Skeleton h={18} mb="sm" radius="sm" w="35%" />
                    <Skeleton h={18} mb="sm" radius="sm" w="18%" />
                    <Skeleton h={18} mb="sm" radius="sm" w="22%" />
                </div>
            ))}
        </div>
    </>
)

type StatCardsSkeletonProps = {
    /** Počet řádků rozpadu v levé a pravé kartě — dvojice karet mívá různý počet. */
    rows?: [number, number]
    /** Řádek poznámky pod titulkem levé/pravé karty. */
    notes?: [boolean, boolean]
}

/** Kostra dvousloupcové mřížky dlaždic (Statistiky). */
export const StatCardsSkeleton: React.FC<StatCardsSkeletonProps> = ({
    rows = [3, 3],
    notes = [false, false],
}) => (
    <SimpleGrid cols={{ base: 1, xs: 2 }} mb="md">
        <StatCardSkeleton count={rows[0]} withNote={notes[0]} />
        <StatCardSkeleton count={rows[1]} withNote={notes[1]} />
    </SimpleGrid>
)

type LectureListSkeletonProps = CountProps & {
    /** Řádků těla bloku pod pruhem hlavičky: diář má jméno skupiny i účastníka (2), přehled
     *  nejbližších lekcí jen jméno (1). */
    bodyLines?: 1 | 2
}

/**
 * Kostra seznamu lekcí (diář, přehled). Kopíruje tvar bloku lekce: pruh hlavičky
 * a pod ním řádky účastníků.
 */
export const LectureListSkeleton: React.FC<LectureListSkeletonProps> = ({
    count = 3,
    bodyLines = 2,
}) => (
    <SkeletonShell>
        {range(count).map((index) => (
            <div key={index}>
                <Skeleton h={34} radius={0} />
                <Skeleton
                    h={18}
                    mb={bodyLines === 1 ? "lg" : undefined}
                    ml="md"
                    mr="md"
                    mt="md"
                    radius="sm"
                    w="60%"
                />
                {bodyLines === 2 && (
                    <Skeleton h={18} mb="lg" ml="md" mr="md" mt="xs" radius="sm" w="40%" />
                )}
            </div>
        ))}
    </SkeletonShell>
)

/** Kostra formuláře v modálním okně — dvojice popisek + pole. */
export const FormSkeleton: React.FC<CountProps> = ({ count = 4 }) => (
    <SkeletonShell>
        {range(count).map((index) => (
            <div key={index}>
                <Skeleton h={16} mb="xs" radius="sm" w="30%" />
                <Skeleton h={38} mb="md" radius="sm" />
            </div>
        ))}
    </SkeletonShell>
)
