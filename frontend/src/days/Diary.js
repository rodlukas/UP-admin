import React, {Component} from "react"
import {Container, Row, Col} from 'reactstrap'
import DashboardDay from './DashboardDay'
import {prettyDate} from "../components/FuncDateTime"

const WORK_DAYS_COUNT = 5

export default class Diary extends Component {
    constructor(props) {
        super(props)
        this.thisMonday = Diary.getLastMonday()
        this.thisFriday = new Date(this.thisMonday)
        this.thisFriday.setDate(this.thisMonday.getDate() + (WORK_DAYS_COUNT-1))
        this.title = "Týdenní přehled: " + prettyDate(this.thisMonday) + " - " + prettyDate(this.thisFriday)
    }

    static getLastMonday() {
        // zjisti datum nejblizsiho pondeli predchazejici datumu (pripadne tentyz datum pokud uz pondeli je)
        let date = new Date()
        date.setDate(date.getDate() + 1 - (date.getDay() || 7))
        return date
    }

    generateWeekOverview() {
        let result = []
        let endDate = new Date(this.thisMonday)
        let workDays = WORK_DAYS_COUNT
        while (workDays > 0) {
            result.push(
                <Col key={workDays}>
                    <DashboardDay date={endDate.toString()}/>
                </Col>)
            endDate.setDate(endDate.getDate() + 1)
            workDays--
        }
        return result
    }

    render() {
        return (
            <div>
                <h1 className="text-center mb-4">{this.title}</h1>
                <Container fluid={true}>
                    <Row>
                        {this.generateWeekOverview()}
                    </Row>
                </Container>
            </div>
        )
    }
}
