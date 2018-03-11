import React, {Component} from "react"
import {Container, Row, Col} from 'reactstrap';
import DashboardDay from './dashboard/DashboardDay'

export default class Diary extends Component {
    constructor(props) {
        super(props)
        this.lastMonday = new Date()
        // zjisti datum nejblizsiho pondeli predchazejici datumu (pripadne tentyz datum pokud uz pondeli je)
        this.lastMonday.setDate(this.lastMonday.getDate() + 1 - (this.lastMonday.getDay() || 7))
        this.days = []
        this.endDate = new Date(this.lastMonday)
        let workDays = 5
        while (workDays > 0) {
            this.days.push(<Col key={workDays}><DashboardDay date={this.endDate.toString()}/></Col>)
            this.endDate.setDate(this.endDate.getDate() + 1)
            workDays--
        }
        this.endDate.setDate(this.endDate.getDate() - 1)
        this.title = "Týdenní přehled: " + this.lastMonday.getDate() + ". " + (this.lastMonday.getMonth() + 1) + ". - " + this.endDate.getDate() + ". " + (this.endDate.getMonth() + 1) + ". "
    }

    render() {
        return (
            <div>
                <h1 className="text-center mb-4">{this.title}</h1>
                <Container fluid={true}>
                    <Row>
                        {this.days}
                    </Row>
                </Container>
            </div>
        )
    }
}
