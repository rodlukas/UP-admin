import React, {Component} from "react"
import {Table, Button, Modal, Badge, Container} from 'reactstrap'
import {Link} from 'react-router-dom'
import FormGroups from '../forms/FormGroups'
import GroupService from "../api/services/group"
import ClientsList from "../components/ClientsList"
import Loading from "../api/Loading"
import APP_URLS from "../urls"

export default class Groups extends Component {
    constructor(props) {
        super(props)
        this.title = "Skupiny"
        this.state = {
            groups: [],
            modal: false,
            currentGroup: {},
            loading: true
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
                this.setState({groups: response, loading: false})
            })
    }

    componentDidMount() {
        this.getGroups()
    }

    render() {
        const {groups, currentGroup} = this.state
        const GroupTable = () =>
            <tbody>
            {groups.map(group =>
                <tr key={group.id}>
                    <td className="col-2">{group.name}</td>
                    <td><Badge pill>{group.course.name}</Badge></td>
                    <td><ClientsList clients={group.memberships}/></td>
                    <td className="col-2">
                        <Button color="primary"
                                onClick={() => this.toggle(group)}>Upravit</Button>{' '}
                        <Link to={APP_URLS.skupiny + "/" + group.id}>
                            <Button color="secondary">Karta</Button></Link>
                    </td>
                </tr>)}
            </tbody>
        return (
            <div>
                <Container>
                    <h1 className="text-center mb-4">
                        {this.title}
                        <Button color="info" className="addBtn" onClick={() => this.toggle()}>Přidat skupinu</Button>
                    </h1>
                    <Table striped size="sm" responsive>
                        <thead className="thead-dark">
                        <tr>
                            <th>Název</th>
                            <th>Kurz</th>
                            <th>Členové</th>
                            <th>Akce</th>
                        </tr>
                        </thead>
                        {this.state.loading ?
                            <tbody><tr><td colSpan="4"><Loading/></td></tr></tbody> :
                            <GroupTable/>}
                    </Table>
                    {!Boolean(groups.length) && !this.state.loading &&
                    <p className="text-muted text-center">
                        Žádné skupiny
                    </p>}
                </Container>
                <Modal isOpen={this.state.modal} toggle={this.toggle} autoFocus={false}>
                    <FormGroups group={currentGroup} funcClose={this.toggle} funcRefresh={this.getGroups}/>
                </Modal>
            </div>
        )
    }
}
