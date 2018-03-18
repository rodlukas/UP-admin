import React, {Component} from "react"
import {Table, Button, Modal, Badge, Container, Row, Col} from 'reactstrap'
import {Link} from 'react-router-dom'
import axios from "axios"
import FormGroups from '../forms/FormGroups'
import AuthService from "../Auth/AuthService"
import {API_URL, NOTIFY_LEVEL, NOTIFY_TEXT} from "../global/GlobalConstants"

export default class Groups extends Component {
    constructor(props) {
        super(props)
        this.title = "Skupiny"
        this.state = {
            groups: [],
            modal: false,
            currentGroup: {}
        }
    }

    toggle = (group = {}) => {
        this.setState({
            currentGroup: group,
            modal: !this.state.modal
        })
    }

    getGroups = () => {
        axios.get(API_URL + 'groups/', AuthService.getHeaders())
            .then((response) => {
                this.setState({groups: response.data})
            })
            .catch((error) => {
                console.log(error)
                this.props.notify(NOTIFY_TEXT.ERROR_LOADING, NOTIFY_LEVEL.ERROR)
            })
    }

    componentDidMount() {
        this.getGroups()
    }

    render() {
        const {groups, currentGroup} = this.state
        const ClientName = ({name, surname}) => <span>{name} {surname}</span>
        const ClientsList = ({clients}) => {
            return (
                <div>
                    {clients.length ?
                        clients.map(membership =>
                            <ClientName key={membership.client.id} name={membership.client.name}
                                        surname={membership.client.surname}/>)
                            .reduce((accu, elem) => {
                                return accu === null ? [elem] : [...accu, ', ', elem]
                            }, null)
                        :
                        <span className="text-muted">žádní členové</span>
                    }
                </div>)
        }
        return (
            <div>
                <h1 className="text-center mb-4">{this.title}</h1>
                <Container fluid={true}>
                    <Row>
                        <Col sm="12" md={{size: 8, offset: 2}}>
                            <Button color="info" onClick={() => this.toggle()}>Přidat skupinu</Button>
                            <Table striped size="sm">
                                <thead className="thead-dark">
                                <tr>
                                    <th>Název</th>
                                    <th>Kurz</th>
                                    <th>Členové</th>
                                    <th>Akce</th>
                                </tr>
                                </thead>
                                <tbody>
                                {groups.map(group =>
                                    <tr key={group.id}>
                                        <td>{group.name}</td>
                                        <td><Badge pill>{group.course.name}</Badge></td>
                                        <td><ClientsList clients={group.memberships}/></td>
                                        <td>
                                            <Button color="primary"
                                                    onClick={() => this.toggle(group)}>Upravit</Button>{' '}
                                            <Link to={"/skupiny/" + group.id}>
                                                <Button color="secondary">Karta</Button></Link>
                                        </td>
                                    </tr>)
                                }
                                </tbody>
                            </Table>
                            {!Boolean(this.state.groups.length) &&
                            <p className="text-muted text-center">
                                Žádné skupiny
                            </p>}
                        </Col>
                    </Row>
                </Container>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <FormGroups group={currentGroup} funcClose={this.toggle} funcRefresh={this.getGroups}
                                notify={this.props.notify}/>
                </Modal>
            </div>
        )
    }
}
