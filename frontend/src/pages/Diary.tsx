import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faChevronCircleLeft,
    faChevronCircleRight,
} from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"
import { Link } from "react-router-dom"
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
import { CustomRouteComponentProps } from "../types/types"
import "./Diary.css"

type TitleDateProps = {
    /** Datum, který se má zobrazit. */
    date: Date
}

/** Pomocná komponenta zobrazující datum v záhlaví diáře. */
const TitleDate: React.FC<TitleDateProps> = ({ date }) => (
    <span
        className={`TitleDate font-weight-bold text-center ${
            isNotCurrentYear(date) ? "TitleDate-long" : ""
        }`}>
        {prettyDateWithYearIfDiff(date)}
    </span>
)

type ParamsProps = {
    /** Rok. */
    year: string
    /** Měsíc. */
    month: string
    /** Den. */
    day: string
}

type Props = CustomRouteComponentProps<ParamsProps>

const parseDateFromParams = (params: ParamsProps): Date => {
    if (params.month != null && params.year != null && params.day != null) {
        return new Date(Number(params.year), Number(params.month) - 1, Number(params.day))
    } else {
        return new Date()
    }
}

const serializeDateUrl = (date: Date): string => {
    return `${APP_URLS.diar.url}/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

/** Stránka s diářem. */
const Diary: React.FC<Props> = (props) => {
    const getRequiredMonday = React.useCallback(
        (): Date => getMonday(parseDateFromParams(props.match.params)),
        [props.match.params],
    )

    const getWeek = React.useCallback(
        (): string[] => getSerializedWeek(parseDateFromParams(props.match.params)),
        [props.match.params],
    )

    /** Pole se dny v zobrazeném týdnu. */
    const [week, setWeek] = React.useState<string[]>(getWeek())

    const getFridayDate = React.useCallback((): Date => new Date(week[4]), [week])

    const getNextMondaySerialized = React.useCallback(
        (): string => serializeDateUrl(addDays(getRequiredMonday(), DAYS_IN_WEEK)),
        [getRequiredMonday],
    )

    const getPrevMondaySerialized = React.useCallback(
        (): string => serializeDateUrl(addDays(getRequiredMonday(), -DAYS_IN_WEEK)),
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
                    props.history.push(getPrevMondaySerialized())
                } else if (key === "ArrowRight") {
                    props.history.push(getNextMondaySerialized())
                }
            }
        },
        [props.history, getPrevMondaySerialized, getNextMondaySerialized],
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
    }, [props.match.params, getRequiredMonday, getWeek, refreshTitle])

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
                            <Link to={getPrevMondaySerialized()} id="Diary_PrevWeek">
                                <FontAwesomeIcon
                                    icon={faChevronCircleLeft}
                                    className="Diary_arrowBtn text-muted"
                                />
                            </Link>
                            <UncontrolledTooltipWrapper target="Diary_PrevWeek">
                                Předchozí týden
                            </UncontrolledTooltipWrapper>{" "}
                            <Link to={getNextMondaySerialized()} id="Diary_NextWeek">
                                <FontAwesomeIcon
                                    icon={faChevronCircleRight}
                                    className="Diary_arrowBtn text-muted"
                                />
                            </Link>
                            <UncontrolledTooltipWrapper target="Diary_NextWeek">
                                Další týden
                            </UncontrolledTooltipWrapper>{" "}
                            <Link to={APP_URLS.diar.url} id="Diary_Today">
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
                    {week.map((day, index) => (
                        <Col key={index} md="6" lg="" className="Diary_day">
                            <DashboardDay date={day} />
                        </Col>
                    ))}
                </Row>
            </Container>
        </>
    )
}

export default Diary
