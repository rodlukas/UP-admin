import * as React from "react"
import { Badge, Container, Table } from "reactstrap"

import GroupService from "../api/services/GroupService"
import APP_URLS from "../APP_URLS"
import ActiveSwitcher from "../components/buttons/ActiveSwitcher"
import ClientsList from "../components/ClientsList"
import CourseName from "../components/CourseName"
import GroupName from "../components/GroupName"
import Heading from "../components/Heading"
import Loading from "../components/Loading"
import Tooltip from "../components/Tooltip"
import {
    CoursesVisibleContextProps,
    WithCoursesVisibleContext,
} from "../contexts/CoursesVisibleContext"
import { GroupsActiveContextProps, WithGroupsActiveContext } from "../contexts/GroupsActiveContext"
import ModalGroups from "../forms/ModalGroups"
import { TEXTS } from "../global/constants"
import { areAllMembersActive } from "../global/utils"
import { ModalGroupsData } from "../types/components"
import { GroupType } from "../types/models"
import { CustomRouteComponentProps } from "../types/types"

type Props = CustomRouteComponentProps & GroupsActiveContextProps & CoursesVisibleContextProps

type State = {
    /** Pole skupin. */
    groups: GroupType[]
    /** Je vybráno zobrazení aktivních skupin (true). */
    active: boolean
    /** Probíhá načítání (true). */
    isLoading: boolean
}

/** Stránka se skupinami. */
class Groups extends React.Component<Props, State> {
    state: State = {
        groups: [],
        isLoading: true,
        active: true,
    }

    isLoading = (): boolean =>
        this.state.active ? !this.props.groupsActiveContext.isLoaded : this.state.isLoading

    getGroupsData = (): GroupType[] =>
        this.state.active ? this.props.groupsActiveContext.groups : this.state.groups

    refreshFromModal = (data: ModalGroupsData): void => {
        data && this.refresh(data.active)
    }

    refresh = (active = this.state.active, ignoreActiveRefresh = false): void => {
        if (active && ignoreActiveRefresh) {
            this.setState({ active: active })
        } else {
            this.setState({ isLoading: true, active: active }, () => this.getGroups(active, true))
        }
    }

    getGroups = (active = this.state.active, callFromRefresh = false): void => {
        if (active && !callFromRefresh) {
            this.props.groupsActiveContext.funcRefresh()
        } else {
            GroupService.getInactive().then((groups) => this.setState({ groups, isLoading: false }))
        }
    }

    componentDidMount(): void {
        this.getGroups()
        // prednacteni pro FormGroups
        this.props.coursesVisibleContext.funcRefresh()
    }

    render(): React.ReactNode {
        return (
            <Container>
                <Heading
                    title={
                        <>
                            {APP_URLS.skupiny.title}{" "}
                            {!this.isLoading() && (
                                <Badge color="secondary" pill>
                                    {this.getGroupsData().length}
                                </Badge>
                            )}
                        </>
                    }
                    buttons={
                        <>
                            <ActiveSwitcher onChange={this.refresh} active={this.state.active} />
                            <ModalGroups refresh={this.refreshFromModal} />
                        </>
                    }
                />
                <Table striped size="sm" responsive className="table-custom">
                    <thead className="thead-light">
                        <tr>
                            <th>Název</th>
                            <th className="d-none d-sm-table-cell">Kurz</th>
                            <th>Členové</th>
                            <th className="text-right text-md-right">Akce</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.isLoading() ? (
                            <tr>
                                <td colSpan={4}>
                                    <Loading />
                                </td>
                            </tr>
                        ) : (
                            <>
                                {this.getGroupsData().map((group) => (
                                    <tr key={group.id} data-qa="group">
                                        <td>
                                            <GroupName group={group} link noWrap />{" "}
                                            {group.active &&
                                                !areAllMembersActive(group.memberships) && (
                                                    <Tooltip
                                                        postfix={`Group_ActiveGroupWithInactiveClientAlert_${group.id}`}
                                                        placement="right"
                                                        size="1x"
                                                        text={
                                                            TEXTS.WARNING_ACTIVE_GROUP_WITH_INACTIVE_CLIENTS
                                                        }
                                                    />
                                                )}
                                        </td>
                                        <td className="d-none d-sm-table-cell">
                                            <CourseName course={group.course} />
                                        </td>
                                        <td>
                                            <ClientsList memberships={group.memberships} />
                                        </td>
                                        <td className="text-right text-md-right">
                                            <ModalGroups
                                                currentGroup={group}
                                                refresh={this.refreshFromModal}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </>
                        )}
                    </tbody>
                </Table>
                {this.getGroupsData().length === 0 && !this.isLoading() && (
                    <p className="text-muted text-center">Žádné skupiny</p>
                )}
            </Container>
        )
    }
}

export default WithCoursesVisibleContext(WithGroupsActiveContext(Groups))
