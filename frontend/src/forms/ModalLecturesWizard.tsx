import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Menu, Select, Skeleton, Tooltip } from "@mantine/core"
import { faChevronDown, faPlus, faSpinnerThird } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import { useQueryClient } from "@tanstack/react-query"
import classNames from "classnames"
import * as React from "react"

import { AnalyticsSource } from "../analytics"
import BaseModal from "../components/BaseModal"
import { SkeletonShell } from "../components/Skeletons"
import { useClientsActiveContext } from "../contexts/ClientsActiveContext"
import { useGroupsActiveContext } from "../contexts/GroupsActiveContext"
import { TEXTS } from "../global/constants"
import { prettyDate } from "../global/funcDateTime"
import {
    DefaultValuesForLecture,
    getDefaultValuesForLecture,
    getLecturesgroupedByCourses,
    prepareDefaultValuesForLecture,
    withSelectedOptions,
} from "../global/utils"
import { ClientType, GroupType } from "../types/models"

import { modalWizardContent } from "./FormBase.css"
import Or from "./helpers/Or"
import { or as orStyles } from "./helpers/Or.css"
import SelectClient from "./helpers/SelectClient"
import ModalClients from "./ModalClients"
import ModalGroups from "./ModalGroups"
import ModalLecturesCore from "./ModalLecturesCore"
import * as styles from "./ModalLecturesWizard.css"

type Props = {
    /** Datum lekce. */
    date?: string
    /** CSS třída pro dropdown pro výběr klient/skupina. */
    dropdownClassName?: string
    /**
     * Velikost tlačítka pro otevření dropdownu pro výběr klient/skupina.
     *
     * Smí jít pod `md` jen bez `dropdownLabel` (viz níž) — pak `size` řídí rozměr ikonové
     * plochy, ne velikost čitelného textu, stejná výjimka jako `ActionIcon` v `theme.ts`.
     * S `dropdownLabel` (viditelný text vedle ikony) je `md` závazné jako všude jinde.
     */
    dropdownSize?: "xs" | "sm" | "md" | "lg" | "xl"
    /**
     * Varianta tlačítka. Výchozí `filled` je pro hlavní akci stránky; opakované výskyty
     * (tlačítko v hlavičce každého dne v diáři) posílej jako `subtle`, aby se z pěti
     * sytých tlačítek nestala barevná mřížka.
     */
    dropdownVariant?: "filled" | "subtle"
    /**
     * Text vedle ikony. Bez něj je tlačítko jen „+" (název nese `aria-label`), což stačí
     * v hlavičce dne, ale ne v prázdném stavu — tam je to jediná nabízená akce a musí
     * být poznat, co udělá.
     */
    dropdownLabel?: string
    /** Směr otevírání dropdownu pro výběr klient/skupina. */
    dropdownDirection?: "up" | "down"
    /** Probíhá načítání dat (true) - zobrazí spinner na tlačítku. */
    isFetching?: boolean
    /** Identifikace místa, odkud bylo modální okno otevřeno (pro analytiku). */
    source: AnalyticsSource
}

/**
 * Modální okno s průvodcem pro přidání lekce.
 * Umožní volbu/vytvoření konkrétního klienta/skupiny. Poté umožní přidání samotné lekce.
 */
const ModalLecturesWizard: React.FC<Props> = (props) => {
    const { source } = props
    const queryClient = useQueryClient()
    const clientsActiveContext = useClientsActiveContext()
    const groupsActiveContext = useGroupsActiveContext()
    const [isClient, setIsClientState] = React.useState<boolean | undefined>(undefined)
    const [object, setObject] = React.useState<ClientType | GroupType | null>(null)
    const [modalSelectDone, setModalSelectDone] = React.useState(false)
    const [defaultValuesForLecture, setDefaultValuesForLecture] =
        React.useState<DefaultValuesForLecture>(prepareDefaultValuesForLecture())
    const [isLoading, setIsLoading] = React.useState(false)
    // Pokud uživatel zavře výběrový modal během rozpracovaného requestu, tato hodnota
    // se zvýší a stale .then() z requestu pak již neaplikuje výsledek (jinak by se
    // hlavní lecture form modal otevřel i po zrušení).
    const requestSeqRef = React.useRef(0)

    const setClient = React.useCallback((newIsClient: boolean): void => {
        setIsClientState(newIsClient)
    }, [])

    /** Zavře modální okna průvodce a vrátí ho do výchozího stavu. */
    const resetWizard = React.useCallback((): void => {
        requestSeqRef.current += 1
        setIsClientState(undefined)
        setModalSelectDone(false)
        setObject(null)
        setIsLoading(false)
    }, [])

    const onSelectChange = React.useCallback(
        (_name: string, obj?: ClientType | GroupType | null): void => {
            if (!obj || isClient === undefined || isLoading) {
                return
            }
            setIsLoading(true)

            const requestSeq = requestSeqRef.current
            // `fetchQuery`, ne přímo `getLecturesgroupedByCourses` — jde tak přes stejný
            // globální error handling (401 odhlásí, 404 přesměruje, chybu ohlásí notifikací)
            // jako každý jiný dotaz v appce (`queryCache.onError` v queryClient.tsx).
            // `useMutation` by ho taky zajistilo, ale navíc by po KAŽDÉM výběru klienta/skupiny
            // spustilo plošnou invalidaci všech dotazů (mutationCache.onSuccess) — tohle je
            // čtení, ne zápis, a `fetchQuery` tenhle vedlejší efekt nemá.
            // `staleTime: 0` přebíjí globální 30s default (queryClient.tsx) — výběr téhož
            // klienta/skupiny podruhé musí vždy vidět čerstvý stav (výchozí hodnoty pro
            // předvyplnění se odvíjí od poslední lekce), ne data z jiného otevření wizardu
            // před chvílí, která mezitím mohla zastarat mimo tenhle QueryClient (jiná
            // karta/session).
            // `networkMode: "always"` je nutny: pri vychozim "online" TanStack Query dotaz
            // offline POZASTAVI a vraceny promise se NIKDY neusadi — `.catch()` ani
            // `.finally()` niz by nedobehly a wizard by tocil spinnerem donekonecna bez
            // jakekoli hlasky. S "always" se pokus provede a rovnou selze, takze uzivatel
            // dostane notifikaci a spinner zhasne (stejne jako pred prechodem na fetchQuery).
            const request = queryClient.fetchQuery({
                queryKey: ["lecturesGroupedByCourses", { id: obj.id, isClient }],
                queryFn: () => getLecturesgroupedByCourses(obj.id, isClient),
                staleTime: 0,
                networkMode: "always",
            })
            void request
                .then((lecturesGroupedByCourses) => {
                    if (requestSeqRef.current !== requestSeq) {
                        return
                    }
                    setDefaultValuesForLecture(getDefaultValuesForLecture(lecturesGroupedByCourses))
                    setObject(obj)
                    setModalSelectDone(true)
                })
                .catch(() => {
                    // chybu už ohlásil globální handler (queryCache.onError) — tady jen
                    // ať nezůstane unhandled rejection, žádnou vlastní notifikaci netřeba
                })
                .finally(() => {
                    if (requestSeqRef.current !== requestSeq) {
                        return
                    }
                    setIsLoading(false)
                })
        },
        [isClient, isLoading, queryClient],
    )

    const processAdditionOfGroupOrClient = React.useCallback(
        (newObject: ClientType | GroupType): void => {
            onSelectChange("", newObject)
        },
        [onSelectChange],
    )

    const title = `Přidat lekci na ${props.date ? prettyDate(new Date(props.date)) : "nějaký den"}`
    let selectedTargetLabel = ""
    if (isClient === true) {
        selectedTargetLabel = "klienta"
    } else if (isClient === false) {
        selectedTargetLabel = "skupiny"
    }

    const renderClientOrGroupSelect = React.useCallback((): React.ReactElement => {
        if (isClient) {
            return (
                <>
                    <SelectClient
                        value={object as ClientType}
                        options={clientsActiveContext.clients}
                        optionsUnavailable={!clientsActiveContext.hasData}
                        onChangeCallback={onSelectChange}
                        label="Klient"
                        required
                    />
                    <Or
                        content={
                            <ModalClients
                                processAdditionOfClient={processAdditionOfGroupOrClient}
                                withOr
                                source="lecture_wizard"
                            />
                        }
                    />
                </>
            )
        }
        // Čerstvě vytvořená skupina (přes "přidat novou", viz processAdditionOfGroupOrClient)
        // se do `object` dostane dřív, než ji asynchronní refetch přidá do
        // `groupsActiveContext.groups`; bez doplnění by Select zobrazil prázdno (stejný
        // vzor jako SelectClient/SelectCourse).
        const groupValue = object as GroupType | null
        const mergedGroups = withSelectedOptions(
            groupsActiveContext.groups,
            groupValue ? [groupValue] : [],
        )
        return (
            <>
                <Select
                    id="group"
                    data={mergedGroups.map((g) => ({
                        value: g.id.toString(),
                        label: g.name,
                    }))}
                    value={groupValue?.id.toString() ?? null}
                    onChange={(val) => {
                        const found = mergedGroups.find((g) => g.id.toString() === val) ?? null
                        onSelectChange("group", found)
                    }}
                    label="Skupina"
                    placeholder="Vyberte existující skupinu…"
                    searchable
                    nothingFoundMessage={
                        groupsActiveContext.hasData
                            ? TEXTS.NO_RESULTS
                            : "Skupiny se nepodařilo načíst"
                    }
                    // pole je vždy povinné (bez něj nejde krok wizardu dokončit) — proč
                    // false, viz allowDeselect u SelectClient
                    allowDeselect={false}
                    withAsterisk
                    // Žádný `autoFocus` schválně — stejný důvod jako u `SelectClient`
                    // (searchable Select by autofocusem hned otevřel dropdown).
                />
                <Or
                    content={
                        <ModalGroups
                            processAdditionOfGroup={processAdditionOfGroupOrClient}
                            withOr
                            source="lecture_wizard"
                        />
                    }
                />
            </>
        )
    }, [
        isClient,
        object,
        clientsActiveContext.clients,
        clientsActiveContext.hasData,
        groupsActiveContext.groups,
        groupsActiveContext.hasData,
        onSelectChange,
        processAdditionOfGroupOrClient,
    ])

    const menuPosition = props.dropdownDirection === "up" ? "top-end" : "bottom-end"
    const tooltipPosition = props.dropdownDirection === "up" ? "bottom" : "top"

    return (
        <>
            <div className={styles.modalLecturesWizard}>
                <Menu position={menuPosition}>
                    {/* Tooltip musí obalovat Menu.Target (ne naopak): Menu.Target klonuje
                        ARIA props (aria-haspopup/expanded/controls) na své přímé dítě a
                        Tooltip by je rozprostřel na plovoucí tělo tooltipu místo na trigger */}
                    <Tooltip label={title} position={tooltipPosition} withinPortal>
                        <Menu.Target>
                            <Button
                                className={classNames(
                                    props.dropdownClassName,
                                    styles.dropdownToggle,
                                )}
                                size={props.dropdownSize}
                                variant={props.dropdownVariant ?? "filled"}
                                // šedá pro `subtle` (viz dropdownVariant výše), indigo zůstává jen hlavní akci
                                color={props.dropdownVariant === "subtle" ? "gray" : undefined}
                                disabled={props.isFetching}
                                // tlacitko obsahuje jen ikony - jmeno pro ctecky z tooltipu
                                aria-label={title}
                                rightSection={
                                    !props.isFetching && (
                                        <FontAwesomeIcon icon={faChevronDown} size="sm" />
                                    )
                                }>
                                <FontAwesomeIcon
                                    icon={props.isFetching ? faSpinnerThird : faPlus}
                                    spin={props.isFetching}
                                    data-qa={props.isFetching ? "loading" : undefined}
                                />
                                {props.dropdownLabel && (
                                    <span className={styles.dropdownToggleLabel}>
                                        {props.dropdownLabel}
                                    </span>
                                )}
                            </Button>
                        </Menu.Target>
                    </Tooltip>
                    <Menu.Dropdown>
                        <Menu.Item onClick={(): void => setClient(true)}>
                            Přidat lekci <strong>klienta</strong>…
                        </Menu.Item>
                        <Menu.Item onClick={(): void => setClient(false)}>
                            Přidat lekci <strong>skupiny</strong>…
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </div>
            {/* Mantine Modal balí children vždy do vlastního Modal.Body — hlavičku proto
                renderuje sám přes prop `title` (viz kontrakt kompozice v BaseModal),
                jinak by byla vnořená v paddingu těla a nešla přes celou šířku okna. */}
            <BaseModal
                opened={isClient !== undefined && !modalSelectDone}
                onClose={resetWizard}
                title={`Přidání lekce – výběr ${selectedTargetLabel}`}
                size="xl"
                classNames={{ content: modalWizardContent }}
                // ostatní modaly maji `data-qa="modal_close"` na vlastnim Modal.CloseButton
                // (viz FormBase kontrakt); tenhle vyuziva Mantine defaultni krizek pres `title`,
                // proto se stejny atribut posila jako closeButtonProps
                closeButtonProps={{ "data-qa": "modal_close" } as React.ComponentProps<"button">}>
                {isClient !== undefined && (
                    <>
                        {isLoading ||
                        (isClient && clientsActiveContext.isLoading) ||
                        (!isClient && groupsActiveContext.isLoading) ? (
                            // jeden select (klient/skupina) + krátký odkaz "nebo přidat nového",
                            // stejně jako skutečný obsah kroku (`renderClientOrGroupSelect`)
                            <SkeletonShell>
                                <Skeleton h={38} radius="sm" />
                                <Skeleton h={18} radius="sm" w="40%" className={orStyles} />
                            </SkeletonShell>
                        ) : (
                            renderClientOrGroupSelect()
                        )}
                    </>
                )}
            </BaseModal>
            <ModalLecturesCore
                object={object}
                defaultValuesForLecture={defaultValuesForLecture}
                shouldModalOpen={modalSelectDone}
                funcCloseCallback={resetWizard}
                date={props.date ?? ""}
                source={source}
            />
        </>
    )
}

export default ModalLecturesWizard
