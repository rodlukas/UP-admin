import React, {Component} from "react"
import {Container, Row, Col} from 'reactstrap';
import DashboardDay from './dashboard/DashboardDay'

export default class Diary extends Component {
    constructor(props) {
        super(props)
        this.date = new Date()
        console.log(this.date)
        this.endDate = new Date(Diary.addDate(this.date, 4))

        this.title = "Týdenní přehled: " + this.date.getDate() + ". " + (this.date.getMonth() + 1) + ". " + this.date.getFullYear() + " - " + this.endDate.getDate() + ". " + (this.endDate.getMonth() + 1) + ". " + this.endDate.getFullYear()
    }

    static toISODate(date)
    {
        return date.toISOString().substring(0, 10)
    }

    static addDate(date, cnt)
    {
        let d = new Date(date)
        d.setDate(d.getDate() + cnt)
        return d
    }

    render() {
        return (
            <div>
                <h1 className="text-center mb-4">{this.title}</h1>
                <Container fluid={true}>
                    <Row>
                        <Col><DashboardDay date={Diary.toISODate(this.date)}/></Col>
                        <Col><DashboardDay date={Diary.toISODate(Diary.addDate(this.date, 1))}/></Col>
                        <Col><DashboardDay date={Diary.toISODate(Diary.addDate(this.date, 2))}/></Col>
                        <Col><DashboardDay date={Diary.toISODate(Diary.addDate(this.date, 3))}/></Col>
                        <Col><DashboardDay date={Diary.toISODate(Diary.addDate(this.date, 4))}/></Col>
                    </Row>
                </Container>
            </div>
        )
    }
}
