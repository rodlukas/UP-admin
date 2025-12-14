import * as React from "react"
import { Badge, Container, Table } from "reactstrap"

import { useInactiveGroups } from "../api/hooks"
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
import { GroupType } from "../types/models"
import { CustomRouteComponentProps } from "../types/types"

type Props = CustomRouteComponentProps & GroupsActiveContextProps & CoursesVisibleContextProps

/** Stránka se skupinami. */
const Groups: React.FC<Props> = (props) => {
    /** Je vybráno zobrazení aktivních skupin (true). */
    const [active, setActive] = React.useState(true)
    const { data: inactiveGroups = [], isLoading: inactiveLoading } = useInactiveGroups(!active)

    const isLoading = (): boolean =>
        active
            ? props.groupsActiveContext.isLoading && props.groupsActiveContext.groups.length === 0
            : inactiveLoading && inactiveGroups.length === 0

    const getGroupsData = (): GroupType[] =>
        active ? props.groupsActiveContext.groups : inactiveGroups

    const refresh = React.useCallback(
        (newActive: boolean = active): void => {
            setActive(newActive)
        },
        [active],
    )

    const refreshFromModal = React.useCallback(
        (data: { active?: boolean } | null): void => {
            if (data?.active !== undefined) {
                refresh(data.active)
            }
        },
        [refresh],
    )

    return (
        <Container>
            <Heading
                title={
                    <>
                        {APP_URLS.skupiny.title}{" "}
                        {!isLoading() && (
                            <Badge color="secondary" pill>
                                {getGroupsData().length}
                            </Badge>
                        )}
                    </>
                }
                buttons={
                    <>
                        <ActiveSwitcher onChange={refresh} active={active} />
                        <ModalGroups refresh={refreshFromModal} />
                    </>
                }
                isFetching={
                    active
                        ? props.groupsActiveContext.isFetching &&
                          props.groupsActiveContext.groups.length > 0
                        : false
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
                    {isLoading() ? (
                        <tr>
                            <td colSpan={4}>
                                <Loading />
                            </td>
                        </tr>
                    ) : (
                        <>
                            {getGroupsData().map((group) => (
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
                                            refresh={refreshFromModal}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </>
                    )}
                </tbody>
            </Table>
            {getGroupsData().length === 0 && !isLoading() && (
                <p className="text-muted text-center">Žádné skupiny</p>
            )}
        </Container>
    )
}

export default WithCoursesVisibleContext(WithGroupsActiveContext(Groups))
