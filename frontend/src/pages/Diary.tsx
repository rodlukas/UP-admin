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
import { DASHBOARDDAY_UPDATE_TYPE } from "../global/constants"
import {
    addDays,
    DAYS_IN_WEEK,
    getMonday,
    getWeekSerializedFromMonday,
    isEqualDate,
    prettyDateWithLongDayYear,
    prettyDateWithYearIfDiff,
    yearDiffs,
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
            yearDiffs(date) ? "TitleDate-long" : ""
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

type State = {
    /** Typ aktualizace komponenty se dnem - pro propagaci aktualizací dalších dní. */
    updateType: number
    /** Pole se dny v zobrazeném týdnu. */
    week: Array<string>
}

/** Stránka s diářem. */
export default class Diary extends React.Component<Props, State> {
    getRequiredMonday = (): Date => getMonday(Diary.parseDateFromParams(this.props.match.params))
    getWeek = (): Array<string> => getWeekSerializedFromMonday(this.getRequiredMonday())

    state: State = {
        updateType: DASHBOARDDAY_UPDATE_TYPE.NONE,
        week: this.getWeek(),
    }

    getFridayDate = (): Date => new Date(this.state.week[4])

    getNextMondaySerialized = (): string =>
        Diary.serializeDateUrl(addDays(this.getRequiredMonday(), DAYS_IN_WEEK))

    getPrevMondaySerialized = (): string =>
        Diary.serializeDateUrl(addDays(this.getRequiredMonday(), -DAYS_IN_WEEK))

    getCurrentMonday = (): Date => getMonday(new Date())

    componentDidMount(): void {
        document.addEventListener("keydown", this.onKeyDown)
        this.refreshTitle()
    }

    componentWillUnmount(): void {
        document.removeEventListener("keydown", this.onKeyDown)
    }

    refreshTitle(): void {
        document.title = pageTitle(
            `${APP_URLS.diar.title} (${prettyDateWithYearIfDiff(
                this.getRequiredMonday()
            )} – ${prettyDateWithYearIfDiff(this.getFridayDate())})`
        )
    }

    componentDidUpdate(prevProps: Props, prevState: State): void {
        // pokud se datum ktery pozadujeme shoduje s tim ve stavu, nic neupdatuj
        if (isEqualDate(new Date(prevState.week[0]), this.getRequiredMonday())) {
            return
        }
        // pozadujeme jiny datum, nez jsme meli ve stavu
        if (
            this.props.match.params.year !== prevProps.match.params.year ||
            this.props.match.params.month !== prevProps.match.params.month ||
            this.props.match.params.day !== prevProps.match.params.day
        ) {
            this.setState({ week: this.getWeek() }, () => {
                this.refreshTitle()
                this.setUpdateType(DASHBOARDDAY_UPDATE_TYPE.DAY_CHANGED)
            })
        }
    }

    onKeyDown = (e: KeyboardEvent): void => {
        // akce provadej jen kdyz neni otevrene modalni okno
        if (!isModalShown()) {
            const key = e.key
            if (key === "ArrowLeft") {
                this.props.history.push(this.getPrevMondaySerialized())
            } else if (key === "ArrowRight") {
                this.props.history.push(this.getNextMondaySerialized())
            }
        }
    }

    static parseDateFromParams(params: ParamsProps): Date {
        if (params.month != null && params.year != null && params.day != null) {
            return new Date(Number(params.year), Number(params.month) - 1, Number(params.day))
        } else {
            return new Date()
        }
    }

    static serializeDateUrl(date: Date): string {
        return `${APP_URLS.diar.url}/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    }

    // aby po kliknuti nezustal focus na tlacitku (nedaji se pak pouzivat klavesove sipky)
    removeFocusAfterClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.currentTarget.blur()
    }

    setUpdateType = (newUpdateType = DASHBOARDDAY_UPDATE_TYPE.DAY_UNCHANGED): void =>
        this.setState({ updateType: newUpdateType }, () =>
            this.setState({ updateType: DASHBOARDDAY_UPDATE_TYPE.NONE })
        )

    render(): React.ReactNode {
        // je dulezite, aby pro .col byl definovany lg="", jinak bude pro >=lg platit hodnota z md
        return (
            <>
                <Container>
                    <Heading
                        fluid
                        title={
                            <>
                                Týden <TitleDate date={this.getRequiredMonday()} /> –{" "}
                                <TitleDate date={this.getFridayDate()} />
                            </>
                        }
                        buttons={
                            <>
                                <Link to={this.getPrevMondaySerialized()} id="Diary_PrevWeek">
                                    <FontAwesomeIcon
                                        icon={faChevronCircleLeft}
                                        className="Diary_arrowBtn text-muted"
                                    />
                                </Link>
                                <UncontrolledTooltipWrapper target="Diary_PrevWeek">
                                    Předchozí týden
                                </UncontrolledTooltipWrapper>{" "}
                                <Link to={this.getNextMondaySerialized()} id="Diary_NextWeek">
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
                                        disabled={isEqualDate(
                                            this.getCurrentMonday(),
                                            this.getRequiredMonday()
                                        )}
                                        onClick={this.removeFocusAfterClick}
                                        className="align-top">
                                        Dnes
                                    </Button>
                                </Link>
                                <UncontrolledTooltipWrapper target="Diary_Today">
                                    {prettyDateWithLongDayYear(new Date())}
                                </UncontrolledTooltipWrapper>{" "}
                                <ModalLecturesWizard refresh={this.setUpdateType} />
                            </>
                        }
                    />
                </Container>
                <Container fluid>
                    <Row>
                        {this.state.week.map((day, index) => (
                            <Col key={index} md="6" lg="" className="Diary_day">
                                <DashboardDay
                                    date={day}
                                    setUpdateType={this.setUpdateType}
                                    updateType={this.state.updateType}
                                />
                            </Col>
                        ))}
                    </Row>
                </Container>
            </>
        )
    }
}
