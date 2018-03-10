import React, {Component} from "react"
import {Table, Button, Modal} from 'reactstrap'
import axios from "axios"
import FormEditGroup from './components/FormEditGroup'

export default class Groups extends Component {
    constructor(props) {
        super(props)
        this.title = "Skupiny"
        this.state = {
            groups: [],
            modal: false,
            currentGroup: []
        }
        this.toggle = this.toggle.bind(this)
    }

    toggle(group = []) {
        this.setState({
            currentGroup: group,
            modal: !this.state.modal
        })
    }

    getGroups = () => {
        axios.get('/api/v1/groups/')
            .then((response) => {
                this.setState({groups: response.data})
            })
            .catch((error) => {
                console.log(error)
            })
    }

    componentDidMount() {
        this.getGroups()
    }

    render() {
        return (
            <div>
                <h1 className="text-center mb-4">{this.title}</h1>
                <Button color="info" onClick={() => this.toggle()}>Přidat skupinu</Button>
                <Table striped size="sm">
                    <thead className="thead-dark">
                    <tr>
                        <th>Název</th>
                        <th>Členové</th>
                        <th>Akce</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.groups.map(
                            group =>
                                <tr key={group.id.toString()}>
                                    <td>{group.name}</td>
                                    <td>
                                        {group.memberships.map(membership => membership.client.name + " " + membership.client.surname).join(", ")}
                                    </td>
                                    <td>
                                        <Button color="primary" onClick={() => this.toggle(group)}>Upravit</Button>{' '}
                                        <Button color="secondary">Karta</Button>
                                    </td>
                                </tr>)
                    }
                    </tbody>
                </Table>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <FormEditGroup group={this.state.currentGroup} funcClose={this.toggle} funcRefresh={this.getGroups}/>
                </Modal>
            </div>
        )
    }
}
