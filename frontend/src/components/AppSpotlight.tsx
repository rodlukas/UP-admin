import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Kbd } from "@mantine/core"
import { useHotkeys } from "@mantine/hooks"
import {
    Spotlight,
    SpotlightActionData,
    SpotlightActionGroupData,
    spotlight,
} from "@mantine/spotlight"
import { faSearch, faUser, faUsers } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import { useNavigate } from "@tanstack/react-router"
import Fuse, { IFuseOptions } from "fuse.js"
import * as React from "react"

import { trackEvent } from "../analytics"
import { useClientsActiveContext } from "../contexts/ClientsActiveContext"
import { useGroupsActiveContext } from "../contexts/GroupsActiveContext"
import {
    pruneUnresolvableRecentRecords,
    readRecentRecords,
    RecentRecord,
} from "../global/recentRecords"
import { clientName, isModalShown, pluralizeCs, prettyPhone } from "../global/utils"
import { ClientActiveType, GroupType } from "../types/models"

import * as styles from "./AppSpotlight.css"
import CourseName from "./CourseName"

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

/**
 * Skupina naposledy otevřených karet. Počet se u ní — na rozdíl od výsledků hledání —
 * nevypisuje: je jich nanejvýš pět a nic se neořezává, takže by číslo nic nesdělovalo.
 */
const RECENT_GROUP_LABEL = "Naposledy otevřené"

/** Max. počet akcí zobrazených v jedné skupině (klienti/skupiny). Ořezává se každá skupina
 *  zvlášť, ne paleta jako celek: společný strop by při početnějších klientech nechal skupiny
 *  úplně vypadnout. Takhle se obě do palety vždy vejdou a délka zůstane v rozumu. */
const MAX_ACTIONS_PER_GROUP = 25

/** Sestaví skupinu výsledků s počtem v popisku; při oříznutí ukáže „zobrazeno z celkem". */
const buildActionGroup = (
    label: string,
    groupActions: SpotlightActionData[],
): SpotlightActionGroupData => {
    const shown = groupActions.slice(0, MAX_ACTIONS_PER_GROUP)
    const labelWithCount =
        groupActions.length > shown.length
            ? `${label} (${shown.length} z ${groupActions.length})`
            : `${label} (${groupActions.length})`
    return { group: labelWithCount, actions: shown }
}

const buildGroupDescription = (group: GroupType): string | undefined => {
    const memberCount = group.memberships.length
    return memberCount > 0
        ? `${memberCount} ${pluralizeCs(memberCount, "člen", "členové", "členů")}`
        : undefined
}

/**
 * Paleta příkazů (⌘K): hledá klienty a skupiny a skáče na stránky aplikace.
 * Prázdný dotaz nabízí navigaci, psaní ji doplní o nalezené záznamy.
 */
const AppSpotlight: React.FC = () => {
    const navigate = useNavigate()
    const [query, setQuery] = React.useState("")
    // čte se při každém otevření, ne během renderu: mezi otevřeními paletu obchází
    // zápis z karty a čtení v renderu by bylo sahání do proměnlivého zdroje mimo React
    const [recentRecords, setRecentRecords] = React.useState<RecentRecord[]>([])
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
                // kurz nese chip v jeho barvě — týž zápis jako v seznamu skupin, takže se
                // skupina hledá podle stejného znaku, podle jakého se pozná v tabulce
                rightSection: <CourseName course={group.course} band />,
                onClick: () => {
                    void navigate({ to: "/skupiny/$id", params: { id: String(group.id) } })
                },
            })),
        [groupsActiveContext.groups, navigate],
    )

    // mapy id → akce pro převod výsledků Fuse zpět na Spotlight akce
    const clientActionsById = React.useMemo(
        () => new Map(clientActions.map((action) => [action.id, action])),
        [clientActions],
    )

    const groupActionsById = React.useMemo(
        () => new Map(groupActions.map((action) => [action.id, action])),
        [groupActions],
    )

    /** Umí záznam přeložit na akci (klient/skupina existuje v aktivním kontextu). */
    const resolveRecentRecord = React.useCallback(
        (record: RecentRecord): SpotlightActionData | undefined =>
            record.kind === "client"
                ? clientActionsById.get(`client-${record.id}`)
                : groupActionsById.get(`group-${record.id}`),
        [clientActionsById, groupActionsById],
    )

    /**
     * Záznam, který natrvalo nejde vyřešit na akci (deaktivace, smazání, nebo neaktivní
     * klient/skupina — obojí mimo aktivní kontext, ze kterého se `client/groupActionsById`
     * skládá), by jinak donekonečna zabíral jedno z pěti míst v historii. Jakmile jsou oba
     * aktivní seznamy jednou načtené, takové záznamy se ze storage potichu odstraní.
     *
     * `pruneUnresolvableRecentRecords` si storage čte čerstvě sám (ne přes `recentRecords`
     * propadlé z posledního otevření palety) — jinak by mezitím jinde zapsaný novější
     * záznam (otevřená karta) tenhle efekt přepsal a smazal.
     *
     * Čeká se na úspěch obou dotazů, ne na dojetí načítání: neúspěšný dotaz taky přestane
     * načítat, ale nechá po sobě prázdné pole, ve kterém by se každý záznam jevil jako
     * nevyřešitelný — historie by se po jediném výpadku sítě smazala celá a nenávratně.
     */
    React.useEffect(() => {
        if (!clientsActiveContext.isSuccess || !groupsActiveContext.isSuccess) {
            return
        }
        const resolvable = pruneUnresolvableRecentRecords(
            (record) => resolveRecentRecord(record) !== undefined,
        )
        setRecentRecords((prev) => {
            if (prev.length === resolvable.length && prev.every((r, i) => r === resolvable[i])) {
                return prev
            }
            return resolvable
        })
    }, [resolveRecentRecord, clientsActiveContext.isSuccess, groupsActiveContext.isSuccess])

    const results = React.useMemo<SpotlightActionGroupData[]>(() => {
        // Prázdný dotaz nabídne naposledy otevřené karty. Vysypat rovnou všechny klienty
        // a skupiny by dalo stěnu jmen bez pořadí podle čehokoliv — procházet se dají na
        // svých stránkách, paleta je od skoku na konkrétní záznam.
        if (!query.trim()) {
            // záznam mezitím mohl zmizet (deaktivace, smazání) — takový se přeskočí
            const recentActions = recentRecords
                .map(resolveRecentRecord)
                .filter((action): action is SpotlightActionData => action !== undefined)
            return recentActions.length > 0
                ? [{ group: RECENT_GROUP_LABEL, actions: recentActions }]
                : []
        }

        // Fuse se `shouldSort: true` vrací výsledky seřazené podle relevance (skóre),
        // akce se proto musí skládat znovu v pořadí výsledků Fuse — pouhé filtrování
        // původního pole by řazení podle relevance zahodilo a nejlepší shoda by mohla
        // skončit pod slabými fuzzy shodami.
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
        const found: SpotlightActionGroupData[] = []
        if (filteredClientActions.length > 0) {
            found.push(buildActionGroup("Klienti", filteredClientActions))
        }
        if (filteredGroupActions.length > 0) {
            found.push(buildActionGroup("Skupiny", filteredGroupActions))
        }
        return found
    }, [
        query,
        recentRecords,
        clientFuse,
        groupFuse,
        clientActionsById,
        groupActionsById,
        resolveRecentRecord,
    ])

    // Dotaz je řízený zdejším stavem: `Spotlight.Root` sice svůj vlastní drží ve storu,
    // ale ten balík ven neexportuje, takže by se odsud nedal přečíst a výsledky nad ním
    // složit. Root ho zrcadlí i do storu, takže na chování palety to nic nemění.
    //
    // Zaznamenat nejnovější stav dotazu (eventy se odešlou až při zavření spotlightu,
    // aby šel report o úspěšnosti hledání nad finálním dotazem, ne nad jedním znakem).
    // Detekce musí být zde, nikoli ve výpočtu výsledků — ten běží v renderu
    // a mutace ref by tam byla vedlejším efektem v render fázi.
    // Fuse se tím hledá 2× na stisk klávesy (zde + ve výsledcích) — vědomý trade-off,
    // při stovkách záznamů je to <1 ms a čistota výpočtu má přednost.
    const onQueryChange = React.useCallback(
        (nextQuery: string) => {
            setQuery(nextQuery)
            if (nextQuery.trim().length >= 2) {
                searchSessionRef.current = {
                    queried: true,
                    hasResults:
                        clientFuse.search(nextQuery).length + groupFuse.search(nextQuery).length >
                        0,
                }
            } else {
                // dotaz smazaný nebo příliš krátký – nepovažuj za vyhledávání, ať se při
                // zavření nehlásí `search_used` nad mezitím opuštěným dotazem
                searchSessionRef.current = { queried: false, hasResults: false }
            }
        },
        [clientFuse, groupFuse],
    )

    const onSpotlightOpen = React.useCallback(() => {
        setRecentRecords(readRecentRecords())
    }, [])

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

    // Během prvního načítání dat (klienti/skupiny ještě nejsou) nesmí paleta tvrdit
    // „nic nenalezeno" – místo toho dá najevo, že se data teprve načítají. Bez dotazu
    // a bez historie není co nabídnout, takže paleta řekne, co s ní.
    const isLoadingData = clientsActiveContext.isLoading || groupsActiveContext.isLoading
    let emptyMessage = "Žádné výsledky odpovídající dotazu."
    if (isLoadingData) {
        emptyMessage = "Načítání…"
    } else if (!query.trim()) {
        emptyMessage = "Začněte psát jméno klienta nebo skupiny."
    }

    return (
        <Spotlight.Root
            shortcut={null}
            size={800}
            query={query}
            onQueryChange={onQueryChange}
            onSpotlightOpen={onSpotlightOpen}
            onSpotlightClose={onSpotlightClose}
            classNames={{ actionSection: styles.actionSection }}>
            <Spotlight.Search
                size="xl"
                placeholder="Hledat klienta nebo skupinu…"
                aria-label="Globální vyhledávání"
                leftSection={<FontAwesomeIcon icon={faSearch} />}
            />
            {results.length > 0 ? (
                <Spotlight.ActionsList mah={500}>
                    {results.map((resultGroup) => (
                        <Spotlight.ActionsGroup key={resultGroup.group} label={resultGroup.group}>
                            {resultGroup.actions.map(({ id, ...action }) => (
                                <Spotlight.Action key={id} highlightQuery {...action} />
                            ))}
                        </Spotlight.ActionsGroup>
                    ))}
                </Spotlight.ActionsList>
            ) : (
                <Spotlight.Empty>{emptyMessage}</Spotlight.Empty>
            )}
            <Spotlight.Footer>
                <div className={styles.footer}>
                    <span className={styles.hint}>
                        <Kbd>↑</Kbd>
                        <Kbd>↓</Kbd> pohyb
                    </span>
                    <span className={styles.hint}>
                        <Kbd>↵</Kbd> otevřít
                    </span>
                    <span className={styles.hint}>
                        <Kbd>esc</Kbd> zavřít
                    </span>
                </div>
            </Spotlight.Footer>
        </Spotlight.Root>
    )
}

export default AppSpotlight
