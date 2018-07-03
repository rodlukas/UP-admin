import React, {Component} from "react"
import {Button, Modal, Container, ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Badge, Col, Row} from "reactstrap"
import ApplicationService from "../api/services/application"
import CourseService from "../api/services/course"
import ClientName from "../components/ClientName"
import Loading from "../api/Loading"
import FormApplications from "../forms/FormApplications"

export default class Applications extends Component {
    constructor(props) {
        super(props)
        this.state = {
            clients: [],
            applications: [],
            IS_MODAL: false,
            currentApplication: {},
            LOADING_CNT: 0
        }
    }

    toggle = (application = {}) => {
        this.setState({
            currentApplication: application,
            IS_MODAL: !this.state.IS_MODAL
        })
    }

    refresh = () => {
        this.setState({LOADING_CNT: this.state.LOADING_CNT - 1})
            this.getApplications()
    }

    getApplications = () => {
        ApplicationService.getAll()
            .then((response) => { // groupby courses
                let group_to_values = response.reduce(function (obj, item) {
                    obj[item.course.name] = obj[item.course.name] || []
                    obj[item.course.name].push(item)
                    return obj
                }, {})
                let groups = Object.keys(group_to_values).map(function (key) {
                    return {course: key, values: group_to_values[key]}
                })
                groups.sort(function (a, b) { // serad podle abecedy
                    if (a.course < b.course) return -1
                    if (a.course > b.course) return 1
                    return 0
                })
                this.setState({
                    applications: groups,
                    LOADING_CNT: this.state.LOADING_CNT + 1
                })
            })
    }

    getCourses = () => {
        CourseService.getAll()
            .then((response) => {
                this.setState({
                    courses: response,
                    LOADING_CNT: this.state.LOADING_CNT + 1
                })
            })
    }

    delete = (id) => {
        ApplicationService.remove(id)
            .then(() => {
                this.close()
                this.refresh()
            })
    }

    componentDidMount() {
        this.getApplications()
        this.getCourses()
    }

    render() {
        const {applications, courses, currentApplication, IS_MODAL, LOADING_CNT} = this.state
        const ApplicationsContent = () =>
            <div>
                {applications.map(application =>
                    <ListGroup key={application.course}>
                        <h4>
                            {application.course}
                            {' '}
                            <Badge pill>
                                {application.values.length} zájemců
                            </Badge>
                        </h4>
                        {application.values.map(applicationVal =>
                            <ListGroupItem key={applicationVal.id}>
                                <Container>
                                    <Row>
                                        <Col>
                                            <ListGroupItemHeading>
                                                <ClientName client={applicationVal.client} link/>
                                            </ListGroupItemHeading>
                                            <ListGroupItemText>
                                                {applicationVal.note}
                                            </ListGroupItemText>
                                        </Col>
                                        <Col>
                                            <Button color="primary" onClick={() => this.toggle(applicationVal)}>
                                                Upravit
                                            </Button>
                                            {' '}
                                            <Button color="danger"
                                                    onClick={() => {
                                                        let msg = "Opravdu chcete smazat zájemce "
                                                            + applicationVal.client.name + " " + applicationVal.client.surname + " o " + applicationVal.course.name + '?'
                                                        if (window.confirm(msg))
                                                            this.delete(applicationVal.id)
                                                    }}>
                                                Smazat
                                            </Button>
                                        </Col>
                                    </Row>
                                </Container>
                            </ListGroupItem>)}
                    </ListGroup>
                )}
            </div>
        return (
            <div>
                <Container>
                    <h1 className="text-center mb-4">
                        Zájemci o kurzy
                        <Button color="info" className="addBtn" onClick={() => this.toggle()}>
                            Přidat zájemce
                        </Button>
                    </h1>
                    {LOADING_CNT !== 2 ?
                        <Loading/> :
                        <ApplicationsContent/>}
                </Container>
                <Modal isOpen={IS_MODAL} toggle={this.toggle} autoFocus={false}>
                    <FormApplications application={currentApplication} courses={courses} funcClose={this.toggle} funcRefresh={this.refresh}/>
                </Modal>
            </div>
        )
    }
}
