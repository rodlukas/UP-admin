import React, {Component} from "react"
import {Table, Button, Modal, Badge, Container, Row, Col} from 'reactstrap'
import {Link} from 'react-router-dom'
import FormGroups from '../forms/FormGroups'
import GroupService from "../api/services/group"
import ClientsList from "../components/ClientsList"

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
        GroupService.getAll()
            .then((response) => {
                this.setState({groups: response})
            })
    }

    componentDidMount() {
        this.getGroups()
    }

    render() {
        const {groups, currentGroup} = this.state
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
                                    </tr>)}
                                </tbody>
                            </Table>
                            {!Boolean(groups.length) &&
                            <p className="text-muted text-center">
                                Žádné skupiny
                            </p>}
                        </Col>
                    </Row>
                </Container>
                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                    <FormGroups group={currentGroup} funcClose={this.toggle} funcRefresh={this.getGroups}/>
                </Modal>
            </div>
        )
    }
}
