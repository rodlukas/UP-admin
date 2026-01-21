import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faChevronCircleLeft,
    faChevronCircleRight,
} from "@rodlukas/fontawesome-pro-solid-svg-icons"
import { Link, useMatch, useNavigate } from "@tanstack/react-router"
import classNames from "classnames"
import * as React from "react"
import { Button, Col, Container, Row } from "reactstrap"

import APP_URLS from "../APP_URLS"
import DashboardDay from "../components/DashboardDay"
import Heading from "../components/Heading"
import UncontrolledTooltipWrapper from "../components/UncontrolledTooltipWrapper"
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
import { isModalShown, pageTitle } from "../global/utils"

import * as styles from "./Diary.css"

type TitleDateProps = {
    /** Datum, který se má zobrazit. */
    date: Date
}

/** Pomocná komponenta zobrazující datum v záhlaví diáře. */
const TitleDate: React.FC<TitleDateProps> = ({ date }) => (
    <span
        className={classNames(styles.titleDate, "fw-bold", "text-center", {
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

const parseDateFromParams = (params: Partial<ParamsProps>): Date => {
    if (params.month != null && params.year != null && params.day != null) {
        return new Date(Number(params.year), Number(params.month) - 1, Number(params.day))
    } else {
        return new Date()
    }
}

const getDateParams = (date: Date): { year: string; month: string; day: string } => ({
    year: String(date.getFullYear()),
    month: String(date.getMonth() + 1),
    day: String(date.getDate()),
})

/** Stránka s diářem. */
const Diary: React.FC = () => {
    const navigate = useNavigate()
    const dayMatch = useMatch({
        from: "/diar/$year/$month/$day",
        shouldThrow: false,
    })
    const monthMatch = useMatch({
        from: "/diar/$year/$month",
        shouldThrow: false,
    })
    const yearMatch = useMatch({
        from: "/diar/$year",
        shouldThrow: false,
    })
    const params = React.useMemo(
        () =>
            (dayMatch?.params as Partial<ParamsProps> | undefined) ??
            (monthMatch?.params as Partial<ParamsProps> | undefined) ??
            (yearMatch?.params as Partial<ParamsProps> | undefined) ??
            {},
        [dayMatch?.params, monthMatch?.params, yearMatch?.params],
    )

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

    const getNextMondayParams = React.useCallback(
        (): { year: string; month: string; day: string } =>
            getDateParams(addDays(getRequiredMonday(), DAYS_IN_WEEK)),
        [getRequiredMonday],
    )

    const getPrevMondayParams = React.useCallback(
        (): { year: string; month: string; day: string } =>
            getDateParams(addDays(getRequiredMonday(), -DAYS_IN_WEEK)),
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
            // akce provadej jen kdyz neni otevrene modalni okno
            if (!isModalShown()) {
                const key = e.key
                if (key === "ArrowLeft") {
                    void navigate({
                        to: "/diar/$year/$month/$day",
                        params: getPrevMondayParams(),
                    })
                } else if (key === "ArrowRight") {
                    void navigate({
                        to: "/diar/$year/$month/$day",
                        params: getNextMondayParams(),
                    })
                }
            }
        },
        [navigate, getPrevMondayParams, getNextMondayParams],
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
                            <Link
                                to="/diar/$year/$month/$day"
                                params={getPrevMondayParams()}
                                id="Diary_PrevWeek">
                                <FontAwesomeIcon
                                    icon={faChevronCircleLeft}
                                    className={classNames(styles.arrowBtn, "text-muted")}
                                />
                            </Link>
                            <UncontrolledTooltipWrapper target="Diary_PrevWeek">
                                Předchozí týden
                            </UncontrolledTooltipWrapper>{" "}
                            <Link
                                to="/diar/$year/$month/$day"
                                params={getNextMondayParams()}
                                id="Diary_NextWeek">
                                <FontAwesomeIcon
                                    icon={faChevronCircleRight}
                                    className={classNames(styles.arrowBtn, "text-muted")}
                                />
                            </Link>
                            <UncontrolledTooltipWrapper target="Diary_NextWeek">
                                Další týden
                            </UncontrolledTooltipWrapper>{" "}
                            <Link
                                to={APP_URLS.diar.url}
                                id="Diary_Today"
                                className={classNames({
                                    [styles.disabledLink]: isEqualDate(
                                        getCurrentMonday(),
                                        getRequiredMonday(),
                                    ),
                                })}>
                                <Button
                                    color="secondary"
                                    disabled={isEqualDate(getCurrentMonday(), getRequiredMonday())}
                                    onClick={removeFocusAfterClick}
                                    className="align-top">
                                    Dnes
                                </Button>
                            </Link>
                            <UncontrolledTooltipWrapper target="Diary_Today">
                                {prettyDateWithLongDayYear(new Date())}
                            </UncontrolledTooltipWrapper>{" "}
                            <ModalLecturesWizard />
                        </>
                    }
                />
            </Container>
            <Container fluid>
                <Row>
                    {/* je dulezite, aby pro .col byl definovany lg="", jinak bude pro >=lg platit hodnota z md */}
                    {week.map((day) => (
                        <Col key={day} md="6" lg="" className={styles.diaryDay}>
                            <DashboardDay date={day} />
                        </Col>
                    ))}
                </Row>
            </Container>
        </>
    )
}

export default Diary
