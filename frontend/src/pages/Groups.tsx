import { faExclamationTriangle } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as React from "react"
import { Container, Table } from "reactstrap"
import GroupService from "../api/services/group"
import ActiveSwitcher from "../components/buttons/ActiveSwitcher"
import ClientsList from "../components/ClientsList"
import CourseName from "../components/CourseName"
import GroupName from "../components/GroupName"
import Heading from "../components/Heading"
import Loading from "../components/Loading"
import UncontrolledTooltipWrapper from "../components/UncontrolledTooltipWrapper"
import {
    CoursesVisibleContextProps,
    WithCoursesVisibleContext
} from "../contexts/CoursesVisibleContext"
import { GroupsActiveContextProps, WithGroupsActiveContext } from "../contexts/GroupsActiveContext"
import ModalGroups from "../forms/ModalGroups"
import { areAllMembersActive } from "../global/utils"
import { ModalGroupsData } from "../types/components"
import { GroupType } from "../types/models"
import { CustomRouteComponentProps } from "../types/types"
import APP_URLS from "../urls"

type Props = CustomRouteComponentProps & GroupsActiveContextProps & CoursesVisibleContextProps

type State = {
    groups: Array<GroupType>
    active: boolean
    isLoading: boolean
}

/** Stránka se skupinami. */
class Groups extends React.Component<Props, State> {
    state: State = {
        groups: [],
        isLoading: true,
        active: true
    }

    isLoading = (): boolean =>
        this.state.active ? !this.props.groupsActiveContext.isLoaded : this.state.isLoading

    getGroupsData = (): Array<GroupType> =>
        this.state.active ? this.props.groupsActiveContext.groups : this.state.groups

    refreshFromModal = (data: ModalGroupsData): void => {
        data && this.refresh(data.active)
    }

    refresh = (active = this.state.active, ignoreActiveRefresh = false): void => {
        if (active && ignoreActiveRefresh) this.setState({ active: active })
        else this.setState({ isLoading: true, active: active }, () => this.getGroups(active, true))
    }

    getGroups = (active = this.state.active, callFromRefresh = false): void => {
        if (active && !callFromRefresh) this.props.groupsActiveContext.funcRefresh()
        else GroupService.getInactive().then(groups => this.setState({ groups, isLoading: false }))
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
                    content={
                        <>
                            {APP_URLS.skupiny.title}
                            <ModalGroups refresh={this.refreshFromModal} />
                            <ActiveSwitcher onChange={this.refresh} active={this.state.active} />
                        </>
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
                                <td colSpan={4}>
                                    <Loading />
                                </td>
                            </tr>
                        ) : (
                            <>
                                {this.getGroupsData().map(group => (
                                    <tr key={group.id} data-qa="group">
                                        <td>
                                            <GroupName group={group} link noWrap />{" "}
                                            {group.active &&
                                                !areAllMembersActive(group.memberships) && (
                                                    <>
                                                        <UncontrolledTooltipWrapper
                                                            placement="right"
                                                            target={
                                                                "Group_ActiveGroupWithInactiveClientAlert_" +
                                                                group.id
                                                            }>
                                                            Ve skupině je neaktivní klient (přestože
                                                            je skupina aktivní), není tedy možné
                                                            přidávat lekce
                                                        </UncontrolledTooltipWrapper>
                                                        <FontAwesomeIcon
                                                            id={
                                                                "Group_ActiveGroupWithInactiveClientAlert_" +
                                                                group.id
                                                            }
                                                            icon={faExclamationTriangle}
                                                            className={"text-danger"}
                                                            size="1x"
                                                        />
                                                    </>
                                                )}
                                        </td>
                                        <td>
                                            <CourseName course={group.course} />
                                        </td>
                                        <td>
                                            <ClientsList memberships={group.memberships} />
                                        </td>
                                        <td>
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
