import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faSpinnerThird } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import classNames from "classnames"
import * as React from "react"
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Modal,
    ModalBody,
    ModalHeader,
    UncontrolledButtonDropdown,
} from "reactstrap"
import { Direction } from "reactstrap/types/lib/Dropdown"

import Loading from "../components/Loading"
import UncontrolledTooltipWrapper from "../components/UncontrolledTooltipWrapper"
import { useClientsActiveContext } from "../contexts/ClientsActiveContext"
import { useGroupsActiveContext } from "../contexts/GroupsActiveContext"
import { prettyDate } from "../global/funcDateTime"
import {
    DefaultValuesForLecture,
    getDefaultValuesForLecture,
    getLecturesgroupedByCourses,
    prepareDefaultValuesForLecture,
} from "../global/utils"
import { ClientType, GroupType } from "../types/models"

import { reactSelectIds } from "./helpers/func"
import Or from "./helpers/Or"
import ReactSelectWrapper from "./helpers/ReactSelectWrapper"
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
    dropdownSize?: string
    /** Směr otevírání dropdownu pro výběr klient/skupina. */
    dropdownDirection?: Direction
    /** Probíhá načítání dat (true) - zobrazí spinner na tlačítku. */
    isFetching?: boolean
}

/**
 * Modální okno s průvodcem pro přidání lekce.
 * Umožní volbu/vytvoření konkrétního klienta/skupiny. Poté umožní přidání samotné lekce.
 */
const ModalLecturesWizard: React.FC<Props> = (props) => {
    const clientsActiveContext = useClientsActiveContext()
    const groupsActiveContext = useGroupsActiveContext()
    /** Uživatel chce přidávat lekci pro klienta (true, jinak přidává pro skupinu). */
    const [isClient, setIsClientState] = React.useState<boolean | undefined>(undefined)
    /** Objekt, který má přiřazenu danou lekci (klient/skupina). */
    const [object, setObject] = React.useState<ClientType | GroupType | null>(null)
    /** Výběr objektu (klient/skupina) je hotový (true). */
    const [modalSelectDone, setModalSelectDone] = React.useState(false)
    /** Výchozí hodnoty pro lekci. */
    const [defaultValuesForLecture, setDefaultValuesForLecture] =
        React.useState<DefaultValuesForLecture>(prepareDefaultValuesForLecture())
    /** Probíhá načítání (true). */
    const [isLoading, setIsLoading] = React.useState(false)

    const setClient = React.useCallback((newIsClient: boolean): void => {
        setIsClientState(newIsClient)
    }, [])

    const toggleModal = React.useCallback((): void => {
        setIsClientState(undefined)
        setModalSelectDone(false)
        setObject(null)
    }, [])

    const onSelectChange = React.useCallback(
        (_name: string, obj?: ClientType | GroupType | null): void => {
            if (!obj || isClient === undefined || isLoading) {
                return
            }
            // skupiny sice maji jasny kurz, ale lze u nich odhadovat datum a cas, proto zde pro ne neprizpusobujeme
            // chovani
            // nejdriv zobraz nacitani, behem ktereho pro vybraneho klienta/skupinu pripravis vychozi hodnoty kurzu, data a
            // casu, pak klienta/skupinu (a tato data) teprve uloz (diky tomu se az pak zobrazi formular) a nacitani skryj
            // pro priste
            setIsLoading(true)

            const request = getLecturesgroupedByCourses(obj.id, isClient)
            void request
                .then((lecturesGroupedByCourses) => {
                    setDefaultValuesForLecture(getDefaultValuesForLecture(lecturesGroupedByCourses))
                    setObject(obj)
                    setModalSelectDone(true)
                })
                .finally(() => {
                    setIsLoading(false)
                })
        },
        [isClient, isLoading],
    )

    const toggleModalSelect = React.useCallback((): void => {
        setIsClientState(undefined)
    }, [])

    const processAdditionOfGroupOrClient = React.useCallback(
        (newObject: ClientType | GroupType): void => {
            onSelectChange("", newObject)
        },
        [onSelectChange],
    )

    const title = `Přidat lekci na ${props.date ? prettyDate(new Date(props.date)) : "nějaký den"}`

    /**
     * Vrací text pro Loading komponentu při výpočtu optimálních hodnot.
     * @returns Text pro zobrazení v Loading komponentě
     */
    const getLoadingText = React.useCallback((): string => {
        const datePart = isClient ? ", čas a kurz" : " a čas"
        const objectPart = isClient ? "klienta" : "skupinu"
        return `Vypočítávám optimální datum${datePart} pro ${objectPart}`
    }, [isClient])

    /**
     * Vrací komponentu pro výběr klienta nebo skupiny podle hodnoty isClient.
     */
    const renderClientOrGroupSelect = React.useCallback((): React.ReactElement => {
        if (isClient) {
            return (
                <>
                    <SelectClient
                        value={object as ClientType}
                        options={clientsActiveContext.clients}
                        onChangeCallback={onSelectChange}
                    />
                    <Or
                        content={
                            <ModalClients
                                processAdditionOfClient={processAdditionOfGroupOrClient}
                                withOr
                            />
                        }
                    />
                </>
            )
        }
        return (
            <>
                <ReactSelectWrapper<GroupType>
                    {...reactSelectIds("group")}
                    value={object as GroupType}
                    getOptionLabel={(option): string => option.name}
                    getOptionValue={(option): string => option.id.toString()}
                    onChange={(newValue): void => onSelectChange("group", newValue)}
                    options={groupsActiveContext.groups}
                    placeholder={"Vyberte existující skupinu..."}
                    required
                    autoFocus
                />
                <Or
                    content={
                        <ModalGroups
                            processAdditionOfGroup={processAdditionOfGroupOrClient}
                            withOr
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

    return (
        <>
            <div className={styles.modalLecturesWizard}>
                <UncontrolledButtonDropdown
                    direction={props.dropdownDirection}
                    className={classNames(props.dropdownClassName, styles.dropdownToggle)}>
                    <DropdownToggle
                        caret
                        size={props.dropdownSize}
                        id={`ModalLecturesWizard_${props.date ?? ""}`}
                        color="primary"
                        disabled={props.isFetching}>
                        <FontAwesomeIcon
                            icon={props.isFetching ? faSpinnerThird : faPlus}
                            size="lg"
                            spin={props.isFetching}
                            data-qa={props.isFetching ? "loading" : undefined}
                        />
                    </DropdownToggle>
                    <UncontrolledTooltipWrapper
                        placement={props.dropdownDirection === "up" ? "bottom" : "top"}
                        target={`ModalLecturesWizard_${props.date ?? ""}`}>
                        {title}
                    </UncontrolledTooltipWrapper>
                    <DropdownMenu end>
                        <DropdownItem onClick={(): void => setClient(true)}>
                            přidat lekci <strong>klienta</strong>...
                        </DropdownItem>
                        <DropdownItem onClick={(): void => setClient(false)}>
                            přidat lekci <strong>skupiny</strong>...
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
            </div>
            <Modal
                isOpen={isClient !== undefined && !modalSelectDone}
                toggle={toggleModalSelect}
                autoFocus={false}>
                <ModalHeader toggle={toggleModalSelect}>
                    Přidání lekce &ndash; výběr{" "}
                    {isClient === true ? "klienta" : isClient === false ? "skupiny" : ""}
                </ModalHeader>
                <ModalBody>
                    {isClient !== undefined && (
                        <>
                            {isLoading ||
                            (isClient && clientsActiveContext.isLoading) ||
                            (!isClient && groupsActiveContext.isLoading) ? (
                                <Loading text={isLoading ? getLoadingText() : undefined} />
                            ) : (
                                renderClientOrGroupSelect()
                            )}
                        </>
                    )}
                </ModalBody>
            </Modal>
            <ModalLecturesCore
                object={object}
                defaultValuesForLecture={defaultValuesForLecture}
                shouldModalOpen={modalSelectDone}
                funcCloseCallback={toggleModal}
                date={props.date ?? ""}
            />
        </>
    )
}

export default ModalLecturesWizard
