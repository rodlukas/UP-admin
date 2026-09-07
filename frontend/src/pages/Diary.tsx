import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Container, Group, Tooltip } from "@mantine/core"
import { faChevronLeft, faChevronRight } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import { Link, useNavigate, useParams } from "@tanstack/react-router"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import classNames from "classnames"
import * as React from "react"

import { trackEvent } from "../analytics"
import { useLecturesFromDays } from "../api/hooks"
import APP_URLS from "../APP_URLS"
import DashboardDay from "../components/DashboardDay"
import Heading from "../components/Heading"
import ModalLecturesWizard from "../forms/ModalLecturesWizard"
import {
    addDays,
    DAYS_IN_WEEK,
    getMonday,
    getSerializedWeek,
    isEqualDate,
    isNotCurrentYear,
    prettyDateWithLongDayYear,
    prettyDateWithLongDayYearIfDiff,
    prettyDateWithYearIfDiff,
} from "../global/funcDateTime"
import { top } from "../global/utility.css"
import { isModalShown, pageTitle } from "../global/utils"
import { DEFAULT_DELAY, useDelayedValue } from "../hooks/useDelayedValue"

import * as styles from "./Diary.css"

type TitleDateProps = {
    /** Datum, který se má zobrazit. */
    date: Date
}

/** Pomocná komponenta zobrazující datum v záhlaví diáře. */
const TitleDate: React.FC<TitleDateProps> = ({ date }) => (
    <span
        className={classNames(styles.titleDate, {
            [styles.titleDateLong]: isNotCurrentYear(date),
        })}>
        {prettyDateWithYearIfDiff(date)}
    </span>
)

type ParamsProps = {
    /** Rok. */
    year?: string
    /** Měsíc. */
    month?: string
    /** Den. */
    day?: string
}

const normalizeParams = (params: unknown): Partial<ParamsProps> => {
    const record = params && typeof params === "object" ? (params as Record<string, unknown>) : {}
    return {
        year: typeof record.year === "string" ? record.year : undefined,
        month: typeof record.month === "string" ? record.month : undefined,
        day: typeof record.day === "string" ? record.day : undefined,
    }
}

const parseDateFromParams = (params: Partial<ParamsProps>): Date => {
    if (params.month != null && params.year != null && params.day != null) {
        const date = new Date(Number(params.year), Number(params.month) - 1, Number(params.day))
        if (!Number.isNaN(date.getTime())) {
            return date
        }
    }
    return new Date()
}

const getDateParams = (date: Date): { year: string; month: string; day: string } => ({
    year: String(date.getFullYear()),
    month: String(date.getMonth() + 1),
    day: String(date.getDate()),
})

/** Stránka s diářem. */
const Diary: React.FC = () => {
    const navigate = useNavigate()
    const rawParams = useParams({ strict: false })
    const params = React.useMemo(() => normalizeParams(rawParams), [rawParams])

    const getRequiredMonday = React.useCallback(
        (): Date => getMonday(parseDateFromParams(params)),
        [params],
    )

    const getWeek = React.useCallback(
        (): string[] => getSerializedWeek(parseDateFromParams(params)),
        [params],
    )

    /** Pole se dny v zobrazeném týdnu — odvozeno z URL parametrů, ne stav. */
    const week = React.useMemo(() => getWeek(), [getWeek])

    const getFridayDate = React.useCallback((): Date => new Date(week[4]), [week])

    /**
     * Volné dny se z mřížky vynechávají, aby zbylé sloupce dostaly víc místa (týden bývá
     * z poloviny prázdný a prázdné sloupce jen ubíraly šířku těm s lekcemi). Dotazy sdílí
     * klíč s `DashboardDay`, takže se tím nic nedotahuje navíc.
     *
     * Týden se **zpožďuje stejně jako v `DashboardDay`** (`useDelayedValue`): bez toho by
     * tenhle hook střílel pět dotazů okamžitě na každý proklik týdne a debounce, který
     * si dny drží, by nic neznamenal.
     */
    const weekKey = React.useMemo(() => week.join(","), [week])
    const delayedWeekKey = useDelayedValue(weekKey, DEFAULT_DELAY, false)
    const queriedWeek = React.useMemo(() => delayedWeekKey.split(","), [delayedWeekKey])
    const dayResults = useLecturesFromDays(queriedWeek)

    const isWeekSettled =
        delayedWeekKey === weekKey && !dayResults.some((result) => result.isLoading)

    /**
     * Indexy dnů (0 = pondělí … 4 = pátek), které se **opravdu načetly a jsou prázdné**.
     * Selhaný dotaz sem projít nesmí: den by z mřížky zmizel a v proužku volných dnů tvrdil,
     * že se nic nekoná, přestože lekce existují (a šla by na ten termín založit kolizní lekce).
     */
    const settledEmptyWeekdays = isWeekSettled
        ? week
              .map((_, index) => index)
              .filter(
                  (index) =>
                      dayResults[index]?.isSuccess && (dayResults[index]?.data?.length ?? 0) === 0,
              )
        : []

    /**
     * Vzorec volných dnů z naposledy načteného týdne.
     *
     * Kolik sloupců mřížka nakonec bude mít se během načítání zjistit nedá — je to informace,
     * která přijde až s odpovědí. Dokud se proto ukazovalo všech pět dnů, mřížka po doběhnutí
     * dotazů skočila na skutečný počet a zbylé sloupce se naráz roztáhly, při každém prokliku.
     * Rozvrh se ale týden co týden opakuje, takže „které dny byly volné minule" je dost dobrý
     * odhad na to, aby se šířka sloupců při běžném prokliku vůbec nehnula.
     *
     * Odhad je jen dočasný a nikdy nic netvrdí: jakmile týden doběhne, řídí se skrývání zase
     * skutečnou odpovědí, takže den se lekcemi (nebo den, jehož dotaz selhal) se vrátí zpátky.
     * Když se rozvrh změní, dorovná se to po načtení — tedy nejhůř tak, jak to bylo doteď vždy.
     */
    const [lastEmptyWeekdays, setLastEmptyWeekdays] = React.useState<number[]>([])
    const settledEmptyKey = isWeekSettled ? settledEmptyWeekdays.join(",") : null

    React.useEffect(() => {
        if (settledEmptyKey === null) {
            return
        }
        setLastEmptyWeekdays(settledEmptyKey === "" ? [] : settledEmptyKey.split(",").map(Number))
    }, [settledEmptyKey])

    /**
     * U zcela prázdného týdne se ukazují všechny dny — jinak by nebylo kam přidat lekci.
     */
    const hiddenWeekdays = isWeekSettled ? settledEmptyWeekdays : lastEmptyWeekdays
    const hideEmptyDays = hiddenWeekdays.length > 0 && hiddenWeekdays.length < week.length
    const visibleDays = hideEmptyDays
        ? week.filter((_, index) => !hiddenWeekdays.includes(index))
        : week
    /**
     * Den skrytý z mřížky (viz `hideEmptyDays` výš) nesmí zůstat úplně nedosažitelný —
     * proužek proto ukazuje i dny skryté jen podle odhadu (`!isWeekSettled`), ne jen ty
     * potvrzené skutečnou odpovědí. Rozdíl nese popisek (`Volno` vs `Načítání…`): odhad
     * pořád nesmí tvrdit, že se v daném dni nic nekoná, jen musí nechat dosažitelné
     * tlačítko na přidání lekce, dokud se buď potvrdí, nebo se den vrátí zpátky do mřížky.
     */
    const freeDays = hideEmptyDays
        ? week.filter((_, index) => hiddenWeekdays.includes(index))
        : []

    const prevMondayParams = React.useMemo(
        () => getDateParams(addDays(getRequiredMonday(), -DAYS_IN_WEEK)),
        [getRequiredMonday],
    )
    const nextMondayParams = React.useMemo(
        () => getDateParams(addDays(getRequiredMonday(), DAYS_IN_WEEK)),
        [getRequiredMonday],
    )

    const getCurrentMonday = (): Date => getMonday(new Date())

    const refreshTitle = React.useCallback((): void => {
        document.title = pageTitle(
            `${APP_URLS.diar.title} (${prettyDateWithYearIfDiff(
                getRequiredMonday(),
            )} – ${prettyDateWithYearIfDiff(getFridayDate())})`,
        )
    }, [getRequiredMonday, getFridayDate])

    const onKeyDown = React.useCallback(
        (e: KeyboardEvent): void => {
            // akce provadej jen kdyz neni otevrene modalni okno a nejde o auto-repeat (drzeni klavesy)
            if (isModalShown() || e.repeat) {
                return
            }
            // nepretezuj editovatelne prvky (input/textarea/contenteditable) – sipkam tam patri pohyb kurzoru
            if (
                e.target instanceof HTMLElement &&
                e.target.closest("input, textarea, [contenteditable]")
            ) {
                return
            }
            const key = e.key
            if (key === "ArrowLeft") {
                trackEvent("diary_navigated", { direction: "prev", method: "keyboard" })
                void navigate({
                    to: "/diar/$year/$month/$day",
                    params: prevMondayParams,
                })
            } else if (key === "ArrowRight") {
                trackEvent("diary_navigated", { direction: "next", method: "keyboard" })
                void navigate({
                    to: "/diar/$year/$month/$day",
                    params: nextMondayParams,
                })
            }
        },
        [navigate, prevMondayParams, nextMondayParams],
    )

    // aby po kliknuti nezustal focus na tlacitku (nedaji se pak pouzivat klavesove sipky)
    const removeFocusAfterClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.currentTarget.blur()
    }

    React.useEffect(() => {
        document.addEventListener("keydown", onKeyDown)
        return () => {
            document.removeEventListener("keydown", onKeyDown)
        }
    }, [onKeyDown])

    React.useEffect(() => {
        refreshTitle()
    }, [refreshTitle])

    return (
        <>
            <Container>
                <Heading
                    title={
                        <>
                            Týden <TitleDate date={getRequiredMonday()} /> –{" "}
                            <TitleDate date={getFridayDate()} />
                        </>
                    }
                    buttons={
                        <>
                            {/* Navigace tydne je jeden shluk neutralnich ovladacu; jedina
                                primarni (indigo) akce v hlavicce je pridani lekce. */}
                            <Group gap="0.25rem" wrap="nowrap" className={styles.weekNav}>
                                {/* focus: obsah tooltipu musí být dosažitelný i z klávesnice (WCAG 1.4.13) */}
                                <Tooltip
                                    label="Předchozí týden"
                                    events={{ hover: true, focus: true, touch: true }}>
                                    {/* odkaz obsahuje jen ikonu - jmeno pro ctecky */}
                                    <Link
                                        aria-label="Předchozí týden"
                                        to="/diar/$year/$month/$day"
                                        params={prevMondayParams}
                                        className={styles.arrowLink}
                                        onClick={(): void => {
                                            trackEvent("diary_navigated", {
                                                direction: "prev",
                                                method: "click",
                                            })
                                        }}>
                                        <FontAwesomeIcon
                                            icon={faChevronLeft}
                                            className={styles.arrowBtn}
                                        />
                                    </Link>
                                </Tooltip>{" "}
                                <Tooltip
                                    label="Další týden"
                                    events={{ hover: true, focus: true, touch: true }}>
                                    {/* odkaz obsahuje jen ikonu - jmeno pro ctecky */}
                                    <Link
                                        aria-label="Další týden"
                                        to="/diar/$year/$month/$day"
                                        params={nextMondayParams}
                                        className={styles.arrowLink}
                                        onClick={(): void => {
                                            trackEvent("diary_navigated", {
                                                direction: "next",
                                                method: "click",
                                            })
                                        }}>
                                        <FontAwesomeIcon
                                            icon={faChevronRight}
                                            className={styles.arrowBtn}
                                        />
                                    </Link>
                                </Tooltip>{" "}
                                <Tooltip label={prettyDateWithLongDayYear(new Date())}>
                                    {isEqualDate(getCurrentMonday(), getRequiredMonday()) ? (
                                        <span className={styles.disabledLink}>
                                            <Button variant="default" disabled className={top}>
                                                Dnes
                                            </Button>
                                        </span>
                                    ) : (
                                        <Link to={APP_URLS.diar.url}>
                                            <Button
                                                variant="default"
                                                onClick={(e): void => {
                                                    removeFocusAfterClick(e)
                                                    trackEvent("diary_navigated", {
                                                        direction: "today",
                                                        method: "click",
                                                    })
                                                }}
                                                className={top}>
                                                Dnes
                                            </Button>
                                        </Link>
                                    )}
                                </Tooltip>
                            </Group>
                            <ModalLecturesWizard source="diary" />
                        </>
                    }
                />
            </Container>
            {/* proměnná sedí na obalu, ne na mřížce: strop šířky ji čte `weekGrid`
                a vlastní mřížka pod ním ji podědí */}
            <div
                className={styles.weekGrid}
                style={assignInlineVars({
                    [styles.visibleDayCount]: String(visibleDays.length),
                })}>
                <div className={styles.weekRow}>
                    {visibleDays.map((day) => (
                        // klíč je den v týdnu (1-5), ne konkrétní datum: `DashboardDay` má
                        // vlastní debounce dotazu (`useDelayedValue`), který při prokliku
                        // týdnů funguje, jen když komponenta pro daný sloupec přetrvá —
                        // s klíčem podle data by se při každém prokliku odmountovala
                        // a znovu namountovala a debounce by nic neznamenal
                        <div key={new Date(day).getDay()} className={styles.weekDayCol}>
                            <DashboardDay date={day} source="diary" />
                        </div>
                    ))}
                </div>
                {freeDays.length > 0 && (
                    <div className={styles.freeDaysBar}>
                        {/* Nepotvrzený odhad netvrdí "Volno" (den může mít lekce, až
                            doběhne skutečná odpověď) - jen drží tlačítko pro přidání
                            lekce dosažitelné, dokud se den buď potvrdí, nebo vrátí
                            zpátky do mřížky. */}
                        <span className={styles.freeDaysLabel}>
                            {isWeekSettled ? "Volno" : "Načítání…"}
                        </span>
                        {freeDays.map((day) => (
                            <span key={day} className={styles.freeDayItem}>
                                {prettyDateWithLongDayYearIfDiff(new Date(day))}
                                {/* přidání lekce musí zůstat dosažitelné i pro skrytý den */}
                                <ModalLecturesWizard
                                    date={day}
                                    source="diary"
                                    dropdownVariant="subtle"
                                    dropdownSize="xs"
                                />
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}

export default Diary
