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
    const parts = [client.phone ? prettyPhone(client.phone) : null, client.email || null].filter(
        Boolean,
    )
    return parts.length > 0 ? parts.join(" · ") : undefined
}

/** Popisek skupiny výsledků s počtem položek. */
const groupLabel = (label: string, count: number): string => `${label} (${count})`

const buildGroupDescription = (group: GroupType): string | undefined => {
    const memberCount = group.memberships.length
    const courseName = group.course?.name
    const parts = [
        courseName ? `kurz: ${courseName}` : null,
        memberCount > 0
            ? `${memberCount} ${memberCount === 1 ? "člen" : memberCount < 5 ? "členové" : "členů"}`
            : null,
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
                group: groupLabel("Klienti", clientActions.length),
                actions: clientActions,
            })
        }
        if (groupActions.length > 0) {
            groups.push({
                group: groupLabel("Skupiny", groupActions.length),
                actions: groupActions,
            })
        }
        return groups
    }, [clientActions, groupActions])

    // mapy id → akce pro převod výsledků Fuse zpět na Spotlight akce
    const clientActionsById = React.useMemo(
        () => new Map(clientActions.map((action) => [action.id, action])),
        [clientActions],
    )

    const groupActionsById = React.useMemo(
        () => new Map(groupActions.map((action) => [action.id, action])),
        [groupActions],
    )

    const filter = React.useCallback<SpotlightFilterFunction>(
        (query, actionsToFilter) => {
            // prázdný dotaz = výchozí stav spotlightu se všemi akcemi a celkovými počty
            if (!query.trim()) {
                return actionsToFilter
            }

            // Fuse se `shouldSort: true` vrací výsledky seřazené podle relevance (skóre),
            // akce se proto musí skládat znovu v pořadí výsledků Fuse — pouhé filtrování
            // původního pole by řazení podle relevance zahodilo a nejlepší shoda by mohla
            // skončit pod slabými fuzzy shodami (případně kvůli `limit` úplně zmizet).
            const filteredClientActions = clientFuse
                .search(query)
                .map((result) => clientActionsById.get(`client-${result.item.id}`))
                .filter((action): action is SpotlightActionData => action !== undefined)

            const filteredGroupActions = groupFuse
                .search(query)
                .map((result) => groupActionsById.get(`group-${result.item.id}`))
                .filter((action): action is SpotlightActionData => action !== undefined)

            // počty v popiscích skupin musí odpovídat počtu nalezených výsledků,
            // ne celkovému počtu klientů/skupin
            const filtered: (SpotlightActionData | SpotlightActionGroupData)[] = []
            if (filteredClientActions.length > 0) {
                filtered.push({
                    group: groupLabel("Klienti", filteredClientActions.length),
                    actions: filteredClientActions,
                })
            }
            if (filteredGroupActions.length > 0) {
                filtered.push({
                    group: groupLabel("Skupiny", filteredGroupActions.length),
                    actions: filteredGroupActions,
                })
            }
            return filtered
        },
        [clientFuse, groupFuse, clientActionsById, groupActionsById],
    )

    // Zaznamenat nejnovější stav dotazu (eventy se odešlou až při zavření spotlightu,
    // aby šel report o úspěšnosti hledání nad finálním dotazem, ne nad jedním znakem).
    // Detekce musí být zde, nikoli ve `filter` — ten Mantine volá během renderu
    // a mutace ref by tam byla vedlejším efektem v render fázi.
    // Fuse se tím hledá 2× na stisk klávesy (zde + ve `filter`) — vědomý trade-off,
    // při stovkách záznamů je to <1 ms a čistota `filter` má přednost.
    const onQueryChange = React.useCallback(
        (query: string) => {
            if (query.trim().length >= 2) {
                searchSessionRef.current = {
                    queried: true,
                    hasResults:
                        clientFuse.search(query).length + groupFuse.search(query).length > 0,
                }
            }
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
    // Prazdne `tagsToIgnore` – paleta prikazu se musi otevrit globalne, tedy i pri
    // fokusu v input/textarea/select (vychozi chovani useHotkeys by je ignorovalo).
    useHotkeys(
        [
            [
                "mod+K",
                () => {
                    if (!isModalShown()) {
                        spotlight.open()
                    }
                },
            ],
        ],
        [],
    )

    return (
        <Spotlight
            actions={actions}
            nothingFound="Žádné výsledky odpovídající dotazu."
            shortcut={null}
            limit={20}
            highlightQuery
            scrollAreaProps={{ mah: 420 }}
            filter={filter}
            onQueryChange={onQueryChange}
            onSpotlightClose={onSpotlightClose}
            searchProps={{
                placeholder: "Vyhledat klienta nebo skupinu…",
                "aria-label": "Globální vyhledávání",
            }}
        />
    )
}

export default AppSpotlight
