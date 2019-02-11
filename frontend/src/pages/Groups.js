import React, {Component, Fragment} from "react"
import {Table, Modal, Container} from "reactstrap"
import FormGroups from "../forms/FormGroups"
import GroupService from "../api/services/group"
import ClientsList from "../components/ClientsList"
import Loading from "../components/Loading"
import GroupName from "../components/GroupName"
import CourseName from "../components/CourseName"
import EditButton from "../components/buttons/EditButton"
import AddButton from "../components/buttons/AddButton"
import Heading from "../components/Heading"
import ActiveSwitcher from "../components/buttons/ActiveSwitcher"

export default class Groups extends Component {
    state = {
        groups: [],
        IS_MODAL: false,
        currentGroup: {},
        IS_LOADING: true,
        active: true
    }

    toggle = (group = {}) =>
        this.setState({
            currentGroup: group,
            IS_MODAL: !this.state.IS_MODAL
        })

    refresh = (active = this.state.active) => {
        this.setState({IS_LOADING: true, active: active}, () => this.getGroups(active))
    }

    getGroups = (active = this.state.active) => {
        const request = active ? GroupService.getActive() : GroupService.getInactive()
        request.then(groups => this.setState({groups, IS_LOADING: false}))
    }

    componentDidMount() {
        this.getGroups()
    }

    render() {
        const {groups, currentGroup, IS_MODAL, IS_LOADING} = this.state
        const GroupTable = () =>
            <tbody>
            {groups.map(group =>
                <tr key={group.id} data-qa="group">
                    <td>
                        <GroupName group={group} link/>
                    </td>
                    <td>
                        <CourseName course={group.course}/>
                    </td>
                    <td>
                        <ClientsList clients={group.memberships}/>
                    </td>
                    <td>
                        <EditButton onClick={() => this.toggle(group)} data-qa="button_edit_group"/>
                    </td>
                </tr>)}
            </tbody>
        const HeadingContent = () =>
            <Fragment>
                Skupiny
                <AddButton content="Přidat skupinu" onClick={() => this.toggle()} data-qa="button_add_group"/>
                <ActiveSwitcher onChange={this.refresh} active={this.state.active}/>
            </Fragment>
        return (
            <div>
                <Container>
                    <Heading content={<HeadingContent/>}/>
                    <Table striped size="sm" responsive className="pageContent">
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
                    <FormGroups group={currentGroup} funcClose={this.toggle} funcRefresh={this.refresh}/>
                </Modal>
            </div>
        )
    }
}
