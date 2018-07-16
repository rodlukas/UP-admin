import React, {Component} from "react"
import {Table, Modal, Container} from "reactstrap"
import FormGroups from "../forms/FormGroups"
import GroupService from "../api/services/group"
import ClientsList from "../components/ClientsList"
import Loading from "../api/Loading"
import GroupName from "../components/GroupName"
import CourseName from "../components/CourseName"
import EditButton from "../components/buttons/EditButton"
import AddButton from "../components/buttons/AddButton"

export default class Groups extends Component {
    state = {
        groups: [],
        IS_MODAL: false,
        currentGroup: {},
        IS_LOADING: true
    }

    toggle = (group = {}) => {
        this.setState({
            currentGroup: group,
            IS_MODAL: !this.state.IS_MODAL
        })
    }

    getGroups = () => {
        GroupService.getAll()
            .then(groups => this.setState({groups, IS_LOADING: false}))
    }

    componentDidMount() {
        this.getGroups()
    }

    render() {
        const {groups, currentGroup, IS_MODAL, IS_LOADING} = this.state
        const GroupTable = () =>
            <tbody>
            {groups.map(group =>
                <tr key={group.id}>
                    <td className="col-2">
                        <GroupName group={group} link/>
                    </td>
                    <td>
                        <CourseName course={group.course}/>
                    </td>
                    <td>
                        <ClientsList clients={group.memberships}/>
                    </td>
                    <td className="col-2">
                        <EditButton onClick={() => this.toggle(group)}/>
                    </td>
                </tr>)}
            </tbody>
        return (
            <div>
                <Container>
                    <h1 className="text-center mb-4">
                        Skupiny
                        <AddButton title="Přidat skupinu" onClick={() => this.toggle()}/>
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
                        {IS_LOADING ?
                            <tbody>
                                <tr>
                                    <td colSpan="4">
                                        <Loading/>
                                    </td>
                                </tr>
                            </tbody> :
                            <GroupTable/>}
                    </Table>
                    {!Boolean(groups.length) && !IS_LOADING &&
                    <p className="text-muted text-center">
                        Žádné skupiny
                    </p>}
                </Container>
                <Modal isOpen={IS_MODAL} toggle={this.toggle} autoFocus={false}>
                    <FormGroups group={currentGroup} funcClose={this.toggle} funcRefresh={this.getGroups}/>
                </Modal>
            </div>
        )
    }
}
