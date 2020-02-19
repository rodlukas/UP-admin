import { faPlus } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { Fragment } from "react"
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Modal,
    ModalBody,
    ModalHeader,
    UncontrolledButtonDropdown
} from "reactstrap"
import Loading from "../components/Loading"
import UncontrolledTooltipWrapper from "../components/UncontrolledTooltipWrapper"
import { WithClientsActiveContext } from "../contexts/ClientsActiveContext"
import { WithGroupsActiveContext } from "../contexts/GroupsActiveContext"
import { prettyDate } from "../global/funcDateTime"
import {
    getDefaultValuesForLecture,
    getLecturesgroupedByCourses,
    prepareDefaultValuesForLecture
} from "../global/utils"
import CustomReactSelect from "./helpers/CustomReactSelect"
import { react_select_ids } from "./helpers/func"
import Or from "./helpers/Or"
import SelectClient from "./helpers/SelectClient"
import ModalClients from "./ModalClients"
import ModalGroups from "./ModalGroups"
import ModalLecturesCore from "./ModalLecturesCore"
import "./ModalLecturesWizard.css"

/**
 * Modální okno s průvodcem pro přidání lekce.
 * Umožní volbu/vytvoření konkrétního klienta/skupiny. Poté umožní přidání samotné lekce.
 */
class ModalLecturesWizard extends React.Component {
    state = {
        IS_CLIENT: undefined,
        object: null,
        modalSelectDone: false,
        defaultValuesForLecture: prepareDefaultValuesForLecture(),
        IS_LOADING: false
    }

    setClient(IS_CLIENT) {
        if (IS_CLIENT) this.props.clientsActiveContext.funcRefresh()
        else this.props.groupsActiveContext.funcRefresh()
        this.setState({
            IS_CLIENT: IS_CLIENT
        })
    }

    toggleModal = () => {
        this.setState({
            IS_CLIENT: undefined,
            modalSelectDone: false,
            object: null
        })
    }

    onSelectChange = obj => {
        // skupiny sice maji jasny kurz, ale lze u nich odhadovat datum a cas, proto zde pro ne neprizpusobujeme chovani
        // nejdriv zobraz nacitani, behem ktereho pro vybraneho klienta/skupinu pripravis vychozi hodnoty kurzu, data a casu,
        // pak klienta/skupinu (a tato data) teprve uloz (diky tomu se az pak zobrazi formular) a nacitani skryj pro priste
        this.setState({ IS_LOADING: true }, () => {
            const request = getLecturesgroupedByCourses(obj.id, this.state.IS_CLIENT)
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
                            IS_LOADING: false
                        })
                )
            })
        })
    }

    toggleModalSelect = () => {
        this.setState({ IS_CLIENT: undefined })
    }

    processAdditionOfGroupOrClient = newObject => {
        this.setState({ object: newObject })
    }

    refreshAfterModalSelect = () => {
        this.setState({ modalSelectDone: true })
    }

    refreshAfterSave = () => {
        this.setState({
            IS_CLIENT: undefined,
            modalSelectDone: false,
            object: null
        })
        this.props.refresh()
    }

    render() {
        const title =
            "Přidat lekci na " +
            (this.props.date ? prettyDate(new Date(this.props.date)) : "nějaký den")
        return (
            <Fragment>
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
                            <DropdownItem onClick={() => this.setClient(true)}>
                                přidat lekci <strong>klienta</strong>...
                            </DropdownItem>
                            <DropdownItem onClick={() => this.setClient(false)}>
                                přidat lekci <strong>skupiny</strong>...
                            </DropdownItem>
                        </DropdownMenu>
                    </UncontrolledButtonDropdown>
                </div>
                <Modal
                    isOpen={this.state.IS_CLIENT !== undefined && !this.state.modalSelectDone}
                    toggle={this.toggleModalSelect}
                    autoFocus={false}
                    onClosed={() => console.log("onClosed")}>
                    <ModalHeader toggle={this.toggleModalSelect}>
                        Přidání lekce &ndash; výběr{" "}
                        {this.state.IS_CLIENT
                            ? "klienta"
                            : this.state.IS_CLIENT !== undefined
                            ? "skupiny"
                            : ""}
                    </ModalHeader>
                    <ModalBody>
                        {this.state.IS_CLIENT !== undefined && (
                            <Fragment>
                                {this.state.IS_LOADING ||
                                (this.state.IS_CLIENT &&
                                    !this.props.clientsActiveContext.isLoaded) ||
                                (this.state.IS_CLIENT === false &&
                                    !this.props.groupsActiveContext.isLoaded) ? (
                                    <Loading
                                        text={
                                            this.state.IS_LOADING &&
                                            `Vypočítávám optimální datum${
                                                this.state.IS_CLIENT ? ", čas a kurz" : " a čas"
                                            } pro ${this.state.IS_CLIENT ? "klienta" : "skupinu"}`
                                        }
                                    />
                                ) : this.state.IS_CLIENT ? (
                                    <Fragment>
                                        <SelectClient
                                            value={this.state.object}
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
                                                    sendResult
                                                    inSentence
                                                />
                                            }
                                        />
                                    </Fragment>
                                ) : (
                                    <Fragment>
                                        <CustomReactSelect
                                            {...react_select_ids("group")}
                                            value={this.state.object}
                                            getOptionLabel={option => option.name}
                                            getOptionValue={option => option.id}
                                            onChange={newValue => this.onSelectChange(newValue)}
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
                                                    sendResult
                                                    inSentence
                                                />
                                            }
                                        />
                                    </Fragment>
                                )}
                            </Fragment>
                        )}
                    </ModalBody>
                </Modal>
                <ModalLecturesCore
                    refresh={this.refreshAfterSave}
                    object={this.state.object}
                    IS_CLIENT={this.state.IS_CLIENT}
                    defaultValuesForLecture={this.state.defaultValuesForLecture}
                    shouldModalOpen={this.state.modalSelectDone}
                    funcCloseCallback={this.toggleModal}
                    date={this.props.date || ""}
                />
            </Fragment>
        )
    }
}

export default WithClientsActiveContext(WithGroupsActiveContext(ModalLecturesWizard))
