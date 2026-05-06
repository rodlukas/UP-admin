import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spotlight, SpotlightActionData, SpotlightFilterFunction } from "@mantine/spotlight"
import { faUser, faUsers } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import { useNavigate } from "@tanstack/react-router"
import Fuse, { IFuseOptions } from "fuse.js"
import * as React from "react"

import { trackEvent } from "../analytics"
import { useClientsActiveContext } from "../contexts/ClientsActiveContext"
import { useGroupsActiveContext } from "../contexts/GroupsActiveContext"
import { clientName } from "../global/utils"
import { ClientActiveType, GroupType } from "../types/models"

const clientFuseOptions: IFuseOptions<ClientActiveType> = {
    shouldSort: true,
    ignoreDiacritics: true,
    threshold: 0.5,
    keys: ["firstname", "surname", "phone", "email", "normalized"],
}

const groupFuseOptions: IFuseOptions<GroupType> = {
    shouldSort: true,
    ignoreDiacritics: true,
    threshold: 0.4,
    keys: ["name"],
}

/** Spotlight pro globální vyhledávání klientů a skupin. */
const AppSpotlight: React.FC = () => {
    const navigate = useNavigate()
    const clientsActiveContext = useClientsActiveContext()
    const groupsActiveContext = useGroupsActiveContext()
    const searchTrackedRef = React.useRef(false)

    const clientFuse = React.useMemo(
        () => new Fuse(clientsActiveContext.clients, clientFuseOptions),
        [clientsActiveContext.clients],
    )

    const groupFuse = React.useMemo(
        () => new Fuse(groupsActiveContext.groups, groupFuseOptions),
        [groupsActiveContext.groups],
    )

    const clientActions: SpotlightActionData[] = React.useMemo(
        () =>
            clientsActiveContext.clients.map((client) => ({
                id: `client-${client.id}`,
                label: clientName(client),
                description: [client.phone, client.email].filter(Boolean).join(" · ") || undefined,
                leftSection: <FontAwesomeIcon icon={faUser} fixedWidth />,
                group: "Klienti",
                onClick: () => {
                    void navigate({ to: "/klienti/$id", params: { id: String(client.id) } })
                },
            })),
        [clientsActiveContext.clients, navigate],
    )

    const groupActions: SpotlightActionData[] = React.useMemo(
        () =>
            groupsActiveContext.groups.map((group) => ({
                id: `group-${group.id}`,
                label: group.name,
                leftSection: <FontAwesomeIcon icon={faUsers} fixedWidth />,
                group: "Skupiny",
                onClick: () => {
                    void navigate({ to: "/skupiny/$id", params: { id: String(group.id) } })
                },
            })),
        [groupsActiveContext.groups, navigate],
    )

    const actions = React.useMemo(
        () => [...clientActions, ...groupActions],
        [clientActions, groupActions],
    )

    const filter = React.useCallback<SpotlightFilterFunction>(
        (query, actionsToFilter) => {
            if (!query.trim()) {
                return actionsToFilter
            }

            if (!searchTrackedRef.current) {
                trackEvent("search_used", { has_results: actionsToFilter.length > 0 })
                searchTrackedRef.current = true
            }

            const clientResults = clientFuse.search(query)
            const clientIds = new Set(clientResults.map((r) => `client-${r.item.id}`))

            const groupResults = groupFuse.search(query)
            const groupIds = new Set(groupResults.map((r) => `group-${r.item.id}`))

            return actionsToFilter.filter((action): action is SpotlightActionData => {
                if (!("id" in action)) {
                    return false
                }
                return clientIds.has(action.id) || groupIds.has(action.id)
            })
        },
        [clientFuse, groupFuse],
    )

    const onSpotlightClose = React.useCallback(() => {
        searchTrackedRef.current = false
    }, [])

    return (
        <Spotlight
            actions={actions}
            nothingFound="Žádné výsledky"
            shortcut={["mod + K", "/"]}
            limit={10}
            filter={filter}
            onSpotlightClose={onSpotlightClose}
            searchProps={{
                placeholder: "Vyhledat klienta...",
                "aria-label": "Globální vyhledávání",
            }}
        />
    )
}

export default AppSpotlight
