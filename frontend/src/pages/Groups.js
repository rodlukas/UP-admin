import React, {Component, Fragment} from "react"
import {Container, Table} from "reactstrap"
import GroupService from "../api/services/group"
import ActiveSwitcher from "../components/buttons/ActiveSwitcher"
import ClientsList from "../components/ClientsList"
import CourseName from "../components/CourseName"
import GroupName from "../components/GroupName"
import Heading from "../components/Heading"
import Loading from "../components/Loading"
import {WithCoursesVisibleContext} from "../contexts/CoursesVisibleContext"
import ModalGroups from "../forms/ModalGroups"
import APP_URLS from "../urls"

class Groups extends Component {
    state = {
        groups: [],
        IS_LOADING: true,
        active: true
    }

    refresh = (active = this.state.active) => {
        this.setState({IS_LOADING: true, active: active}, () => this.getGroups(active))
    }

    getGroups = (active = this.state.active) => {
        const request = active ? GroupService.getActive() : GroupService.getInactive()
        request.then(groups => this.setState({groups, IS_LOADING: false}))
    }

    componentDidMount() {
        this.getGroups()
        // prednacteni pro FormGroups
        this.props.coursesVisibleContext.funcRefresh()
    }

    render() {
        const {groups, IS_LOADING} = this.state
        return (
            <Container>
                <Heading content={
                    <Fragment>
                        {APP_URLS.skupiny.title}
                        <ModalGroups refresh={this.refresh}/>
                        <ActiveSwitcher onChange={this.refresh} active={this.state.active}/>
                    </Fragment>
                }/>
                <Table striped size="sm" responsive className="pageContent">
                    <thead className="thead-dark">
                    <tr>
                        <th>Název</th>
                        <th>Kurz</th>
                        <th>Členové</th>
                        <th>Akce</th>
                    </tr>
                    </thead>
                    <tbody>
                    {IS_LOADING ?
                        <tr>
                            <td colSpan="4">
                                <Loading/>
                            </td>
                        </tr> :
                        <Fragment>
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
                                        <ModalGroups currentGroup={group} refresh={this.refresh}/>
                                    </td>
                                </tr>)}
                        </Fragment>}
                    </tbody>
                </Table>
                {!Boolean(groups.length) && !IS_LOADING &&
                <p className="text-muted text-center">
                    Žádné skupiny
                </p>}
            </Container>
        )
    }
}

export default WithCoursesVisibleContext(Groups)
