import React, {Component} from "react"
import {Container, Row, Col, Button, Modal, ListGroup, ListGroupItem, ListGroupItemHeading, Input} from 'reactstrap'
import axios from "axios"
import {faUsdCircle} from '@fortawesome/fontawesome-pro-solid'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import FormEditLecture from "../forms/FormEditLecture"

export default class ClientView extends Component {
    constructor(props) {
        super(props)
        this.clientId = this.props.match.params.clientId
        this.title = "Karta klienta"
        this.state = {
            client: [],
            modal: false,
            currentLecture: [],
            lectures: []
        }
    }

    toggle = (lecture = []) => {
        this.setState({
            currentLecture: lecture,
            modal: !this.state.modal
        })
    }

    goBack = () => {
        this.props.history.goBack()
    }

    getClient = () => {
        axios.get('/api/v1/clients/' + this.clientId)
            .then((response) => {
                this.setState({client: response.data})
            })
            .catch((error) => {
                console.log(error)
            })
    }

    getLectures = () => {
        axios.get('/api/v1/lectures/?client=' + this.clientId)
            .then((response) => {
                let group_to_values = response.data.reduce(function (obj, item) {
                    obj[item.course.name] = obj[item.course.name] || []
                    obj[item.course.name].push(item)
                    return obj
                }, {})
                let groups = Object.keys(group_to_values).map(function (key) {
                    return {course: key, values: group_to_values[key]}
                })
                this.setState({lectures: groups})
            })
            .catch((error) => {
                console.log(error)
            })
    }

    componentDidMount() {
        this.getClient()
        this.getLectures()
    }

    render() {
        return (
            <div>
                <h1 className="text-center mb-4">{this.title}: {this.state.client.name} {this.state.client.surname}</h1>
                <Button color="secondary" onClick={this.goBack}>Jít zpět</Button>{' '}
                <Button color="info" onClick={() => this.toggle()}>Přidat kurz</Button>
                <Container fluid={true}>
                    <Row>
                        {
                            this.state.lectures.map(
                                lecture =>
                                    <Col key={lecture.course.toString()}>
                                        <div>
                                            <h4 className="text-center">{lecture.course}</h4>
                                            <ListGroup>
                                                {
                                                    lecture.values.map(
                                                        lectureVal => {
                                                            const d = new Date(lectureVal.start)
                                                            return (
                                                                <ListGroupItem key={'l' + lectureVal.id.toString()}>
                                                                    <ListGroupItemHeading>
                                                                        {d.getHours() + ":" + d.getMinutes()}{' '}
                                                                        <FontAwesomeIcon icon={faUsdCircle}
                                                                                         size="2x"
                                                                                         className={lectureVal.attendances[0].paid ? "text-success" : "text-danger"}/>
                                                                    </ListGroupItemHeading>{' '}
                                                                    <p>
                                                                        <Input type="select" bsSize="sm">
                                                                            <option>{lectureVal.attendances[0].attendancestate.name}</option>
                                                                        </Input>{' '}
                                                                        <Button color="primary"
                                                                                onClick={() => this.toggle(lectureVal)}>Upravit</Button>
                                                                    </p>
                                                                </ListGroupItem>)
                                                        })
                                                }
                                            </ListGroup>
                                        </div>
                                    </Col>)
                        }
                    </Row>
                </Container>


                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <FormEditLecture lecture={this.state.currentLecture} funcClose={this.toggle}
                                     funcRefresh={this.getLectures}/>
                </Modal>
            </div>
        )
    }
}
