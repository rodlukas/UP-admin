import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useHotkeys } from "@mantine/hooks"
import {
    Spotlight,
    SpotlightActionData,
    SpotlightActionGroupData,
    SpotlightFilterFunction,
    spotlight,
} from "@mantine/spotlight"
import { faUser, faUsers } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import { useNavigate } from "@tanstack/react-router"
import Fuse, { IFuseOptions } from "fuse.js"
import * as React from "react"

import { trackEvent } from "../analytics"
import { useClientsActiveContext } from "../contexts/ClientsActiveContext"
import { useGroupsActiveContext } from "../contexts/GroupsActiveContext"
import { clientName, isModalShown, prettyPhone } from "../global/utils"
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

const buildClientDescription = (client: ClientActiveType): string | undefined => {
    const parts = [
        client.phone ? prettyPhone(client.phone) : null,
        client.email || null,
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(" · ") : undefined
}

const buildGroupDescription = (group: GroupType): string | undefined => {
    const memberCount = group.memberships.length
    const courseName = group.course?.name
    const parts = [
        courseName ? `kurz: ${courseName}` : null,
        memberCount > 0 ? `${memberCount} ${memberCount === 1 ? "člen" : memberCount < 5 ? "členové" : "členů"}` : null,
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(" · ") : undefined
}

/** Spotlight pro globální vyhledávání klientů a skupin. */
const AppSpotlight: React.FC = () => {
    const navigate = useNavigate()
    const clientsActiveContext = useClientsActiveContext()
    const groupsActiveContext = useGroupsActiveContext()
    const searchSessionRef = React.useRef<{ queried: boolean; hasResults: boolean }>({
        queried: false,
        hasResults: false,
    })

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
                description: buildClientDescription(client),
                leftSection: <FontAwesomeIcon icon={faUser} fixedWidth />,
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
                description: buildGroupDescription(group),
                leftSection: <FontAwesomeIcon icon={faUsers} fixedWidth />,
                onClick: () => {
                    void navigate({ to: "/skupiny/$id", params: { id: String(group.id) } })
                },
            })),
        [groupsActiveContext.groups, navigate],
    )

    const actions = React.useMemo<(SpotlightActionData | SpotlightActionGroupData)[]>(() => {
        const groups: SpotlightActionGroupData[] = []
        if (clientActions.length > 0) {
            groups.push({
                group: `Klienti (${clientActions.length})`,
                actions: clientActions,
            })
        }
        if (groupActions.length > 0) {
            groups.push({
                group: `Skupiny (${groupActions.length})`,
                actions: groupActions,
            })
        }
        return groups
    }, [clientActions, groupActions])

    const filter = React.useCallback<SpotlightFilterFunction>(
        (query, actionsToFilter) => {
            if (!query.trim()) {
                return actionsToFilter
            }

            const clientResults = clientFuse.search(query)
            const clientIds = new Set(clientResults.map((r) => `client-${r.item.id}`))

            const groupResults = groupFuse.search(query)
            const groupIds = new Set(groupResults.map((r) => `group-${r.item.id}`))

            // Zaznamenat nejnovější stav dotazu (eventy se odešlou až při zavření spotlightu,
            // aby šel report o úspěšnosti hledání nad finálním dotazem, ne nad jedním znakem).
            if (query.trim().length >= 2) {
                searchSessionRef.current = {
                    queried: true,
                    hasResults: clientResults.length + groupResults.length > 0,
                }
            }

            const matches = (action: SpotlightActionData): boolean =>
                clientIds.has(action.id) || groupIds.has(action.id)

            const isGroupEntry = (
                entry: SpotlightActionData | SpotlightActionGroupData,
            ): entry is SpotlightActionGroupData => "actions" in entry

            return actionsToFilter
                .map((entry) => {
                    if (isGroupEntry(entry)) {
                        return { ...entry, actions: entry.actions.filter(matches) }
                    }
                    return matches(entry) ? entry : null
                })
                .filter(
                    (
                        entry,
                    ): entry is SpotlightActionData | SpotlightActionGroupData => {
                        if (!entry) {
                            return false
                        }
                        if (isGroupEntry(entry)) {
                            return entry.actions.length > 0
                        }
                        return true
                    },
                )
        },
        [clientFuse, groupFuse],
    )

    const onSpotlightClose = React.useCallback(() => {
        if (searchSessionRef.current.queried) {
            trackEvent("search_used", { has_results: searchSessionRef.current.hasResults })
        }
        searchSessionRef.current = { queried: false, hasResults: false }
    }, [])

    // Vlastni hotkey s `isModalShown()` guardem – pokud je otevreny Mantine Modal,
    // nechci, aby Spotlight prebral focus a vytvoril druhy focus trap.
    // (Internal Mantine shortcut je vypnuty pres `shortcut={null}` nize.)
    useHotkeys([
        [
            "mod+K",
            () => {
                if (!isModalShown()) {
                    spotlight.open()
                }
            },
        ],
    ])

    return (
        <Spotlight
            actions={actions}
            nothingFound="Žádné výsledky odpovídající dotazu."
            shortcut={null}
            limit={20}
            highlightQuery
            scrollAreaProps={{ mah: 420 }}
            filter={filter}
            onSpotlightClose={onSpotlightClose}
            searchProps={{
                placeholder: "Vyhledat klienta nebo skupinu…",
                "aria-label": "Globální vyhledávání",
            }}
        />
    )
}

export default AppSpotlight
