import { faPlus } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as React from "react"
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Modal,
    ModalBody,
    ModalHeader,
    UncontrolledButtonDropdown
} from "reactstrap"
import { Direction } from "reactstrap/lib/Dropdown"
import Loading from "../components/Loading"
import UncontrolledTooltipWrapper from "../components/UncontrolledTooltipWrapper"
import {
    ClientsActiveContextProps,
    WithClientsActiveContext
} from "../contexts/ClientsActiveContext"
import { GroupsActiveContextProps, WithGroupsActiveContext } from "../contexts/GroupsActiveContext"
import { prettyDate } from "../global/funcDateTime"
import {
    DefaultValuesForLecture,
    getDefaultValuesForLecture,
    getLecturesgroupedByCourses,
    prepareDefaultValuesForLecture
} from "../global/utils"
import { ClientType, GroupType } from "../types/models"
import { fEmptyVoid } from "../types/types"
import { reactSelectIds } from "./helpers/func"
import Or from "./helpers/Or"
import ReactSelectWrapper from "./helpers/ReactSelectWrapper"
import SelectClient from "./helpers/SelectClient"
import ModalClients from "./ModalClients"
import ModalGroups from "./ModalGroups"
import ModalLecturesCore from "./ModalLecturesCore"
import "./ModalLecturesWizard.css"

type Props = ClientsActiveContextProps &
    GroupsActiveContextProps & {
        date?: string
        className?: string
        size?: string
        direction?: Direction
        refresh: fEmptyVoid
    }

type State = {
    isClient?: boolean
    object: ClientType | GroupType | null
    modalSelectDone: boolean
    defaultValuesForLecture: DefaultValuesForLecture
    isLoading: boolean
}

/**
 * Modální okno s průvodcem pro přidání lekce.
 * Umožní volbu/vytvoření konkrétního klienta/skupiny. Poté umožní přidání samotné lekce.
 */
class ModalLecturesWizard extends React.Component<Props, State> {
    state: State = {
        isClient: undefined,
        object: null,
        modalSelectDone: false,
        defaultValuesForLecture: prepareDefaultValuesForLecture(),
        isLoading: false
    }

    setClient = (isClient: boolean): void => {
        if (isClient) this.props.clientsActiveContext.funcRefresh()
        else this.props.groupsActiveContext.funcRefresh()
        this.setState({
            isClient: isClient
        })
    }

    toggleModal = (): void => {
        this.setState({
            isClient: undefined,
            modalSelectDone: false,
            object: null
        })
    }

    onSelectChange = (_name: string, obj: ClientType | GroupType | null | undefined): void => {
        const isClient = this.state.isClient
        if (!obj || isClient === undefined) return
        // skupiny sice maji jasny kurz, ale lze u nich odhadovat datum a cas, proto zde pro ne neprizpusobujeme
        // chovani
        // nejdriv zobraz nacitani, behem ktereho pro vybraneho klienta/skupinu pripravis vychozi hodnoty kurzu, data a
        // casu, pak klienta/skupinu (a tato data) teprve uloz (diky tomu se az pak zobrazi formular) a nacitani skryj
        // pro priste
        this.setState({ isLoading: true }, () => {
            const request = getLecturesgroupedByCourses(obj.id, isClient)
            request.then(lecturesGroupedByCourses => {
                this.setState(
                    {
                        defaultValuesForLecture: getDefaultValuesForLecture(
                            lecturesGroupedByCourses
                        )
                    },
                    () =>
                        this.setState({
                            object: obj,
                            modalSelectDone: true,
                            isLoading: false
                        })
                )
            })
        })
    }

    toggleModalSelect = (): void => {
        this.setState({ isClient: undefined })
    }

    processAdditionOfGroupOrClient = (newObject: ClientType | GroupType): void => {
        this.setState({ object: newObject })
    }

    refreshAfterModalSelect = (): void => {
        this.setState({ modalSelectDone: true })
    }

    refreshAfterSave = (): void => {
        this.setState({
            isClient: undefined,
            modalSelectDone: false,
            object: null
        })
        this.props.refresh()
    }

    render(): React.ReactNode {
        const title =
            "Přidat lekci na " +
            (this.props.date ? prettyDate(new Date(this.props.date)) : "nějaký den")
        return (
            <>
                <div className="ModalLecturesWizard">
                    <UncontrolledButtonDropdown
                        direction={this.props.direction}
                        className={this.props.className}>
                        <DropdownToggle
                            caret
                            size={this.props.size}
                            id={"ModalLecturesWizard_" + (this.props.date || "")}
                            color="info">
                            <FontAwesomeIcon icon={faPlus} size="lg" />
                        </DropdownToggle>
                        <UncontrolledTooltipWrapper
                            placement={this.props.direction === "up" ? "bottom" : "top"}
                            target={"ModalLecturesWizard_" + (this.props.date || "")}>
                            {title}
                        </UncontrolledTooltipWrapper>
                        <DropdownMenu right>
                            <DropdownItem onClick={(): void => this.setClient(true)}>
                                přidat lekci <strong>klienta</strong>...
                            </DropdownItem>
                            <DropdownItem onClick={(): void => this.setClient(false)}>
                                přidat lekci <strong>skupiny</strong>...
                            </DropdownItem>
                        </DropdownMenu>
                    </UncontrolledButtonDropdown>
                </div>
                <Modal
                    isOpen={this.state.isClient !== undefined && !this.state.modalSelectDone}
                    toggle={this.toggleModalSelect}
                    autoFocus={false}>
                    <ModalHeader toggle={this.toggleModalSelect}>
                        Přidání lekce &ndash; výběr{" "}
                        {this.state.isClient
                            ? "klienta"
                            : this.state.isClient !== undefined
                            ? "skupiny"
                            : ""}
                    </ModalHeader>
                    <ModalBody>
                        {this.state.isClient !== undefined && (
                            <>
                                {this.state.isLoading ||
                                (this.state.isClient &&
                                    !this.props.clientsActiveContext.isLoaded) ||
                                (this.state.isClient === false &&
                                    !this.props.groupsActiveContext.isLoaded) ? (
                                    <Loading
                                        text={
                                            this.state.isLoading
                                                ? `Vypočítávám optimální datum${
                                                      this.state.isClient
                                                          ? ", čas a kurz"
                                                          : " a čas"
                                                  } pro ${
                                                      this.state.isClient ? "klienta" : "skupinu"
                                                  }`
                                                : undefined
                                        }
                                    />
                                ) : this.state.isClient ? (
                                    <>
                                        <SelectClient
                                            value={this.state.object as ClientType}
                                            options={this.props.clientsActiveContext.clients}
                                            onChangeCallback={this.onSelectChange}
                                        />
                                        <Or
                                            content={
                                                <ModalClients
                                                    processAdditionOfClient={
                                                        this.processAdditionOfGroupOrClient
                                                    }
                                                    refresh={this.refreshAfterModalSelect}
                                                    inSentence
                                                />
                                            }
                                        />
                                    </>
                                ) : (
                                    <>
                                        <ReactSelectWrapper<GroupType>
                                            {...reactSelectIds("group")}
                                            value={this.state.object as GroupType}
                                            getOptionLabel={(option): string => option.name}
                                            getOptionValue={(option): string =>
                                                option.id.toString()
                                            }
                                            onChange={(newValue): void =>
                                                this.onSelectChange(
                                                    "group",
                                                    newValue as GroupType | null | undefined
                                                )
                                            }
                                            options={this.props.groupsActiveContext.groups}
                                            placeholder={"Vyberte existující skupinu..."}
                                            required
                                            autoFocus
                                        />
                                        <Or
                                            content={
                                                <ModalGroups
                                                    processAdditionOfGroup={
                                                        this.processAdditionOfGroupOrClient
                                                    }
                                                    refresh={this.refreshAfterModalSelect}
                                                    inSentence
                                                />
                                            }
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </ModalBody>
                </Modal>
                <ModalLecturesCore
                    refresh={this.refreshAfterSave}
                    object={this.state.object}
                    defaultValuesForLecture={this.state.defaultValuesForLecture}
                    shouldModalOpen={this.state.modalSelectDone}
                    funcCloseCallback={this.toggleModal}
                    date={this.props.date || ""}
                />
            </>
        )
    }
}

export default WithClientsActiveContext(WithGroupsActiveContext(ModalLecturesWizard))
