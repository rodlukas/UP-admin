import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Container, Tooltip } from "@mantine/core"
import {
    faChevronCircleLeft,
    faChevronCircleRight,
} from "@rodlukas/fontawesome-pro-solid-svg-icons"
import { Link, useNavigate, useParams } from "@tanstack/react-router"
import classNames from "classnames"
import * as React from "react"

import { trackEvent } from "../analytics"
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
    prettyDateWithYearIfDiff,
} from "../global/funcDateTime"
import { top } from "../global/utility.css"
import { isModalShown, pageTitle } from "../global/utils"

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
    const record =
        params && typeof params === "object" ? (params as Record<string, unknown>) : {}
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

    /** Pole se dny v zobrazeném týdnu. */
    const [week, setWeek] = React.useState<string[]>(getWeek())

    const getFridayDate = React.useCallback((): Date => new Date(week[4]), [week])

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
            if (isModalShown()) {
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
        refreshTitle()
        return () => {
            document.removeEventListener("keydown", onKeyDown)
        }
    }, [onKeyDown, refreshTitle])

    const prevRequiredMondayRef = React.useRef<Date>(getRequiredMonday())
    React.useEffect(() => {
        const requiredMonday = getRequiredMonday()

        // aktualizujeme pouze pokud se skutecne zmenil pozadovany pocatek tydne
        if (!isEqualDate(prevRequiredMondayRef.current, requiredMonday)) {
            setWeek(getWeek())
            refreshTitle()
            prevRequiredMondayRef.current = requiredMonday
        }
    }, [params, getRequiredMonday, getWeek, refreshTitle])

    return (
        <>
            <Container>
                <Heading
                    fluid
                    title={
                        <>
                            Týden <TitleDate date={getRequiredMonday()} /> –{" "}
                            <TitleDate date={getFridayDate()} />
                        </>
                    }
                    buttons={
                        <>
                            <Tooltip label="Předchozí týden">
                                <Link
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
                                        icon={faChevronCircleLeft}
                                        className={styles.arrowBtn}
                                    />
                                </Link>
                            </Tooltip>{" "}
                            <Tooltip label="Další týden">
                                <Link
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
                                        icon={faChevronCircleRight}
                                        className={styles.arrowBtn}
                                    />
                                </Link>
                            </Tooltip>{" "}
                            <Tooltip label={prettyDateWithLongDayYear(new Date())}>
                                <Link
                                    to={APP_URLS.diar.url}
                                    className={classNames({
                                        [styles.disabledLink]: isEqualDate(
                                            getCurrentMonday(),
                                            getRequiredMonday(),
                                        ),
                                    })}>
                                    <Button
                                        color="gray"
                                        disabled={isEqualDate(
                                            getCurrentMonday(),
                                            getRequiredMonday(),
                                        )}
                                        onClick={(e): void => {
                                            removeFocusAfterClick(e)
                                            // disabled na <Button> uvnitr <Link> nezabrani onClick – nutna explicitni podminka
                                            if (
                                                !isEqualDate(
                                                    getCurrentMonday(),
                                                    getRequiredMonday(),
                                                )
                                            ) {
                                                trackEvent("diary_navigated", {
                                                    direction: "today",
                                                    method: "click",
                                                })
                                            }
                                        }}
                                        className={top}>
                                        Dnes
                                    </Button>
                                </Link>
                            </Tooltip>{" "}
                            <ModalLecturesWizard source="diary" />
                        </>
                    }
                />
            </Container>
            <div className={styles.weekGrid}>
                <div className={styles.weekRow}>
                    {week.map((day) => {
                        const weekdayKey = new Date(day).getDay()
                        return (
                            <div
                                key={weekdayKey}
                                className={classNames(styles.weekDayCol, styles.diaryDay)}>
                                <DashboardDay date={day} source="diary" />
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    )
}

export default Diary
