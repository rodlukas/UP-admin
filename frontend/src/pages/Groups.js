import { faExclamationTriangle } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { Component, Fragment } from "react"
import { Container, Table, UncontrolledTooltip } from "reactstrap"
import GroupService from "../api/services/group"
import ActiveSwitcher from "../components/buttons/ActiveSwitcher"
import ClientsList from "../components/ClientsList"
import CourseName from "../components/CourseName"
import GroupName from "../components/GroupName"
import Heading from "../components/Heading"
import Loading from "../components/Loading"
import { WithCoursesVisibleContext } from "../contexts/CoursesVisibleContext"
import { WithGroupsActiveContext } from "../contexts/GroupsActiveContext"
import ModalGroups from "../forms/ModalGroups"
import { areAllMembersActive } from "../global/utils"
import APP_URLS from "../urls"

class Groups extends Component {
    state = {
        groups: [],
        IS_LOADING: true,
        active: true
    }

    isLoading = () =>
        this.state.active ? !this.props.groupsActiveContext.isLoaded : this.state.IS_LOADING

    getGroupsData = () =>
        this.state.active ? this.props.groupsActiveContext.groups : this.state.groups

    refresh = (active = this.state.active, ignoreActiveRefresh = false) => {
        if (active && ignoreActiveRefresh) this.setState({ active: active })
        else this.setState({ IS_LOADING: true, active: active }, () => this.getGroups(active, true))
    }

    getGroups = (active = this.state.active, callFromRefresh = false) => {
        if (active)
            callFromRefresh
                ? this.props.groupsActiveContext.funcHardRefresh()
                : this.props.groupsActiveContext.funcRefresh()
        else GroupService.getInactive().then(groups => this.setState({ groups, IS_LOADING: false }))
    }

    componentDidMount() {
        this.getGroups()
        // prednacteni pro FormGroups
        this.props.coursesVisibleContext.funcRefresh()
    }

    render() {
        return (
            <Container>
                <Heading
                    content={
                        <Fragment>
                            {APP_URLS.skupiny.title}
                            <ModalGroups refresh={this.refresh} />
                            <ActiveSwitcher onChange={this.refresh} active={this.state.active} />
                        </Fragment>
                    }
                />
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
                        {this.isLoading() ? (
                            <tr>
                                <td colSpan="4">
                                    <Loading />
                                </td>
                            </tr>
                        ) : (
                            <Fragment>
                                {this.getGroupsData().map(group => (
                                    <tr key={group.id} data-qa="group">
                                        <td>
                                            <GroupName group={group} link noWrap />{" "}
                                            {group.active &&
                                                !areAllMembersActive(group.memberships) && (
                                                    <Fragment>
                                                        <UncontrolledTooltip
                                                            placement="right"
                                                            target={
                                                                "active_group_with_inactive_client_alert" +
                                                                group.id
                                                            }>
                                                            Ve skupině je neaktivní klient (přestože
                                                            je skupina aktivní), není tedy možné
                                                            přidávat lekce
                                                        </UncontrolledTooltip>
                                                        <FontAwesomeIcon
                                                            icon={faExclamationTriangle}
                                                            className={"text-danger"}
                                                            size="1x"
                                                            id={
                                                                "active_group_with_inactive_client_alert" +
                                                                group.id
                                                            }
                                                        />
                                                    </Fragment>
                                                )}
                                        </td>
                                        <td>
                                            <CourseName course={group.course} />
                                        </td>
                                        <td>
                                            <ClientsList clients={group.memberships} />
                                        </td>
                                        <td>
                                            <ModalGroups
                                                currentGroup={group}
                                                refresh={this.refresh}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </Fragment>
                        )}
                    </tbody>
                </Table>
                {!Boolean(this.getGroupsData().length) && !this.isLoading() && (
                    <p className="text-muted text-center">Žádné skupiny</p>
                )}
            </Container>
        )
    }
}

export default WithCoursesVisibleContext(WithGroupsActiveContext(Groups))
