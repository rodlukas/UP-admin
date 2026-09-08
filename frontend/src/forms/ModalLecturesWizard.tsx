import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Menu, Select, Skeleton, Tooltip } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { faChevronDown, faPlus, faSpinnerThird } from "@rodlukas/fontawesome-pro-solid-svg-icons"
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
    /** Velikost tlačítka pro otevření dropdownu pro výběr klient/skupina. */
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
            const request = getLecturesgroupedByCourses(obj.id, isClient)
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
                    if (requestSeqRef.current !== requestSeq) {
                        return
                    }
                    // požadavek jde mimo React Query (přímo přes service), takže globální
                    // error handling se neuplatní – chybu musíme ohlásit ručně
                    notifications.show({
                        color: "red",
                        message: "Nepodařilo se načíst data pro předvyplnění formuláře.",
                    })
                })
                .finally(() => {
                    if (requestSeqRef.current !== requestSeq) {
                        return
                    }
                    setIsLoading(false)
                })
        },
        [isClient, isLoading],
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
                        onChangeCallback={onSelectChange}
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
        return (
            <>
                <Select
                    id="group"
                    data={groupsActiveContext.groups.map((g) => ({
                        value: g.id.toString(),
                        label: g.name,
                    }))}
                    value={(object as GroupType | null)?.id.toString() ?? null}
                    onChange={(val) => {
                        const found =
                            groupsActiveContext.groups.find((g) => g.id.toString() === val) ?? null
                        onSelectChange("group", found)
                    }}
                    // select nemá viditelný label — přístupný název pro čtečky obrazovky
                    aria-label="Skupina"
                    placeholder="Vyberte existující skupinu…"
                    searchable
                    nothingFoundMessage={TEXTS.NO_RESULTS}
                    // pole je vzdy povinne (bez neho nejde krok wizardu dokoncit) — bez
                    // tohohle jde hodnotu vynulovat i preklinutim uz vybrane polozky
                    // v otevrenem dropdownu (Mantine `allowDeselect` je jinak defaultne `true`)
                    allowDeselect={false}
                    withAsterisk
                    autoFocus
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
        groupsActiveContext.groups,
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
                    <Tooltip
                        label={title}
                        position={tooltipPosition}
                        withinPortal
                        events={{ hover: true, focus: true, touch: true }}>
                        <Menu.Target>
                            <Button
                                className={classNames(
                                    props.dropdownClassName,
                                    styles.dropdownToggle,
                                )}
                                size={props.dropdownSize}
                                variant={props.dropdownVariant ?? "filled"}
                                // `subtle` varianta je pro opakovane vyskyty, a tam ma byt
                                // tlacitko tlumene — indigo glyf by z peti hlavicek dnu
                                // udelal barevny pas. Hlavni akce stranky zustava indigo.
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
                            přidat lekci <strong>klienta</strong>…
                        </Menu.Item>
                        <Menu.Item onClick={(): void => setClient(false)}>
                            přidat lekci <strong>skupiny</strong>…
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
                classNames={{ content: modalWizardContent }}>
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
