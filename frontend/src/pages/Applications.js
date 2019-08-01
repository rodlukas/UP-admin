import React, {Component, Fragment} from "react"
import {Badge, Col, Container, ListGroup, ListGroupItem, Modal, Row} from "reactstrap"
import ApplicationService from "../api/services/application"
import CourseService from "../api/services/course"
import AddButton from "../components/buttons/AddButton"
import DeleteButton from "../components/buttons/DeleteButton"
import EditButton from "../components/buttons/EditButton"
import ClientName from "../components/ClientName"
import Heading from "../components/Heading"
import Loading from "../components/Loading"
import Phone from "../components/Phone"
import FormApplications from "../forms/FormApplications"
import {groupByCourses} from "../global/utils"
import APP_URLS from "../urls"
import "./Applications.css"

export default class Applications extends Component {
    constructor(props) {
        super(props)
        this.state = {
            applications: [],
            IS_MODAL: false,
            currentApplication: {},
            LOADING_CNT: 0
        }
    }

    toggle = (application = {}) =>
        this.setState(prevState => ({
            currentApplication: application,
            IS_MODAL: !prevState.IS_MODAL
        }))

    refresh = () => {
        this.setState(prevState => ({LOADING_CNT: prevState.LOADING_CNT - 1}))
        this.getApplications()
    }

    getApplications = () =>
        ApplicationService.getAll()
            .then(applications => {
                const grouppedByCourses = groupByCourses(applications)
                this.setState(prevState => ({
                    applications: grouppedByCourses,
                    LOADING_CNT: prevState.LOADING_CNT + 1
                }))
            })

    getCourses = () =>
        CourseService.getVisible()
            .then(courses => this.setState(
                prevState => ({
                    courses,
                    LOADING_CNT: prevState.LOADING_CNT + 1
                })))

    delete = id =>
        ApplicationService.remove(id)
            .then(() => this.refresh())

    componentDidMount() {
        this.getApplications()
        this.getCourses()
    }

    render() {
        const {applications, courses, currentApplication, IS_MODAL, LOADING_CNT} = this.state
        const ApplicantsCount = ({cnt, color}) =>
            <Badge pill style={{color: color}} className="font-weight-bold">
                <span data-qa="applications_for_course_cnt">
                    {cnt}
                </span>
                {' '}zájemc{cnt === 1 ? "e" : ((cnt > 1 && cnt < 5) ? "i" : "ů")}
            </Badge>
        const Application = ({application}) =>
            <Fragment>
                <Col md="3">
                    <h5 className="mb-0">
                        <ClientName client={application.client} link/>
                    </h5>
                </Col>
                <Col md="2">
                    {application.client.phone &&
                    <Phone phone={application.client.phone} icon/>}
                </Col>
                <Col md="4">
                    <span data-qa="application_note">
                        {application.note}
                    </span>
                </Col>
                <Col className="text-right mt-1 mt-md-0" md="3">
                    <EditButton onClick={() => this.toggle(application)} data-qa="button_edit_application"/>
                    {' '}
                    <DeleteButton
                        onClick={() => {
                            let msg = "Opravdu chcete smazat zájemce "
                                + application.client.surname + " " + application.client.name
                                + " o " + application.course.name + '?'
                            if (window.confirm(msg))
                                this.delete(application.id)}}
                        data-qa="button_delete_application"
                    />
                </Col>
            </Fragment>
        const CourseApplications = ({applications}) =>
            <Fragment>
                {applications.map(application =>
                    <ListGroupItem key={application.id} data-qa="application">
                        <Row className="align-items-center">
                            <Application application={application}/>
                        </Row>
                    </ListGroupItem>)}
            </Fragment>
        const AllApplications = () =>
            <div className="pageContent">
                {applications.map(courseApplications =>
                    <ListGroup key={courseApplications.course.id} data-qa="applications_for_course"
                               className="applications_course">
                        <ListGroupItem style={{background: courseApplications.course.color}}>
                            <h4 className="mb-0 Applications_courseHeading">
                                <span data-qa="application_course">
                                    {courseApplications.course.name}
                                </span>
                                {' '}
                                <ApplicantsCount cnt={courseApplications.lectures.length}
                                                 color={courseApplications.course.color}/>
                            </h4>
                        </ListGroupItem>
                        <CourseApplications applications={courseApplications.lectures}/>
                    </ListGroup>)}
                {!Boolean(applications.length) &&
                <p className="text-muted text-center">
                    Žádní zájemci
                </p>}
            </div>
        const HeadingContent = () =>
            <Fragment>
                {APP_URLS.zajemci.title}
                <AddButton content="Přidat zájemce" onClick={() => this.toggle()} data-qa="button_add_application"/>
            </Fragment>
        return (
            <Fragment>
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
            </Fragment>
        )
    }
}
