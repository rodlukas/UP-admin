import React, {Component, Fragment} from "react"
import {Modal, Container, ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Badge, Col, Row} from "reactstrap"
import ApplicationService from "../api/services/application"
import CourseService from "../api/services/course"
import ClientName from "../components/ClientName"
import Loading from "../components/Loading"
import FormApplications from "../forms/FormApplications"
import "./Applications.css"
import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import DeleteButton from "../components/buttons/DeleteButton"
import Heading from "../components/Heading"
import {groupByCourses} from "../global/utils"

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

    toggle = (application = {}) =>
        this.setState({
            currentApplication: application,
            IS_MODAL: !this.state.IS_MODAL
        })

    refresh = () => {
        this.setState({LOADING_CNT: this.state.LOADING_CNT - 1})
        this.getApplications()
    }

    getApplications = () =>
        ApplicationService.getAll()
            .then(applications => {
                const grouppedByCourses = groupByCourses(applications)
                this.setState({
                    applications: grouppedByCourses,
                    LOADING_CNT: this.state.LOADING_CNT + 1
                })
            })

    getCourses = () =>
        CourseService.getVisible()
            .then(courses => this.setState({
                courses,
                LOADING_CNT: this.state.LOADING_CNT + 1
            }))

    delete = id =>
        ApplicationService.remove(id)
            .then(() => this.refresh())

    componentDidMount() {
        this.getApplications()
        this.getCourses()
    }

    render() {
        const {applications, courses, currentApplication, IS_MODAL, LOADING_CNT} = this.state
        const ApplicantsCount = ({cnt}) =>
            <Badge color="secondary" pill>
                {cnt}
                {' '}zájemc{cnt === 1 ? "e" : ((cnt > 1 && cnt < 5) ? "i" : "ů")}
            </Badge>
        const Application = ({application}) =>
            <Fragment>
                <Col>
                    <ListGroupItemHeading>
                        <ClientName client={application.client} link/>
                    </ListGroupItemHeading>
                    <ListGroupItemText>
                        {application.note}
                    </ListGroupItemText>
                </Col>
                <Col>
                    <EditButton onClick={() => this.toggle(application)}/>
                    {' '}
                    <DeleteButton
                        onClick={() => {
                            let msg = "Opravdu chcete smazat zájemce "
                                + application.client.surname + " " + application.client.name
                                + " o " + application.course.name + '?'
                            if (window.confirm(msg))
                                this.delete(application.id)
                    }}/>
                </Col>
            </Fragment>
        const CourseApplications = ({applications}) =>
            <Fragment>
                {applications.map(application =>
                    <ListGroupItem key={application.id}>
                        <Container>
                            <Row>
                                <Application application={application}/>
                            </Row>
                        </Container>
                    </ListGroupItem>)}
            </Fragment>
        const AllApplications = () =>
            <Fragment>
                {applications.map(courseApplications =>
                    <ListGroup key={courseApplications.course}>
                        <h4 className="Applications-h4">
                            {courseApplications.course}
                            {' '}
                            <ApplicantsCount cnt={courseApplications.values.length}/>
                        </h4>
                        <CourseApplications applications={courseApplications.values}/>
                    </ListGroup>)}
                {!Boolean(applications.length) &&
                <p className="text-muted text-center">
                    Žádní zájemci
                </p>}
            </Fragment>
        const HeadingContent = () =>
            <Fragment>
                Zájemci o kurzy
                <AddButton title="Přidat zájemce" onClick={() => this.toggle()}/>
            </Fragment>
        return (
            <div>
                <Container>
                    <Heading content={<HeadingContent/>}/>
                    {LOADING_CNT !== 2 ?
                        <Loading/> :
                        <AllApplications/>}
                </Container>
                <Modal isOpen={IS_MODAL} toggle={this.toggle} autoFocus={false}>
                    <FormApplications application={currentApplication} courses={courses} funcClose={this.toggle}
                                      funcRefresh={this.refresh}/>
                </Modal>
            </div>
        )
    }
}
