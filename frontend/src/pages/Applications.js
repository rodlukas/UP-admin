import React, {Component, Fragment} from "react"
import {Badge, Col, Container, ListGroup, ListGroupItem, Modal, Row} from "reactstrap"
import ApplicationService from "../api/services/application"
import AddButton from "../components/buttons/AddButton"
import DeleteButton from "../components/buttons/DeleteButton"
import EditButton from "../components/buttons/EditButton"
import ClientName from "../components/ClientName"
import Heading from "../components/Heading"
import Loading from "../components/Loading"
import Phone from "../components/Phone"
import {WithCoursesVisibleContext} from "../contexts/CoursesVisibleContext"
import FormApplications from "../forms/FormApplications"
import {groupByCourses} from "../global/utils"
import APP_URLS from "../urls"
import "./Applications.css"

class Applications extends Component {
    state = {
        applications: [],
        IS_MODAL: false,
        currentApplication: {},
        LOADING_CNT: 0
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

    delete = id =>
        ApplicationService.remove(id)
            .then(() => this.refresh())

    componentDidMount() {
        this.getApplications()
        // prednacteni pro FormApplications
        this.props.coursesVisibleContext.funcRefresh()
    }

    render() {
        const {applications, currentApplication, IS_MODAL, LOADING_CNT} = this.state
        return (
            <Fragment>
                <Container>
                    <Heading content={
                        <Fragment>
                            {APP_URLS.zajemci.title}
                            <AddButton content="Přidat zájemce" onClick={() => this.toggle()}
                                       data-qa="button_add_application"/>
                        </Fragment>
                    }/>
                    {LOADING_CNT !== 1 ?
                        <Loading/> :
                        <div className="pageContent">
                            {applications.map(courseApplications => {
                                const cnt = courseApplications.lectures.length
                                return (
                                    <ListGroup key={courseApplications.course.id} data-qa="applications_for_course"
                                               className="applications_course">
                                        <ListGroupItem style={{background: courseApplications.course.color}}>
                                            <h4 className="mb-0 Applications_courseHeading">
                                                <span data-qa="application_course">
                                                    {courseApplications.course.name}
                                                </span>
                                                {' '}
                                                <Badge pill style={{color: courseApplications.course.color}}
                                                       className="font-weight-bold">
                                                    <span data-qa="applications_for_course_cnt">
                                                        {cnt}
                                                    </span>
                                                    {' '}zájemc{cnt === 1 ? "e" : ((cnt > 1 && cnt < 5) ? "i" : "ů")}
                                                </Badge>
                                            </h4>
                                        </ListGroupItem>
                                        {courseApplications.lectures.map(application =>
                                            <ListGroupItem key={application.id} data-qa="application">
                                                <Row className="align-items-center">
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
                                                        <EditButton onClick={() => this.toggle(application)}
                                                                    data-qa="button_edit_application"/>
                                                        {' '}
                                                        <DeleteButton
                                                            onClick={() => {
                                                                let msg = "Opravdu chcete smazat zájemce "
                                                                    + application.client.surname + " " + application.client.name
                                                                    + " o " + application.course.name + '?'
                                                                if (window.confirm(msg))
                                                                    this.delete(application.id)
                                                            }}
                                                            data-qa="button_delete_application"
                                                        />
                                                    </Col>
                                                </Row>
                                            </ListGroupItem>)}
                                    </ListGroup>)
                            })}
                            {!Boolean(applications.length) &&
                            <p className="text-muted text-center">
                                Žádní zájemci
                            </p>}
                        </div>}
                </Container>
                <Modal isOpen={IS_MODAL} toggle={this.toggle} autoFocus={false}>
                    <FormApplications application={currentApplication} funcClose={this.toggle}
                                      funcRefresh={this.refresh}/>
                </Modal>
            </Fragment>
        )
    }
}

export default WithCoursesVisibleContext(Applications)
