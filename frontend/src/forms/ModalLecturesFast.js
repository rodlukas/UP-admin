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
    UncontrolledButtonDropdown,
    UncontrolledTooltip
} from "reactstrap"
import Loading from "../components/Loading"
import { WithClientsActiveContext } from "../contexts/ClientsActiveContext"
import { WithGroupsActiveContext } from "../contexts/GroupsActiveContext"
import { prettyDate } from "../global/funcDateTime"
import {
    getDefaultValuesForLecture,
    getLecturesForGroupingByCourses,
    groupByCourses
} from "../global/utils"
import CustomReactSelect from "./helpers/CustomReactSelect"
import { react_select_ids } from "./helpers/func"
import Or from "./helpers/Or"
import SelectClient from "./helpers/SelectClient"
import ModalClients from "./ModalClients"
import ModalGroups from "./ModalGroups"
import "./ModalLecturesFast.css"
import ModalLecturesPlain from "./ModalLecturesPlain"

class ModalLecturesFast extends React.Component {
    state = {
        IS_CLIENT: undefined,
        object: null,
        defaultValuesForLecture: null,
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
            object: null
        })
    }

    onSelectChange = (obj, name = null) => {
        // skupiny sice maji jasny kurz, ale lze u nich odhadovat datum a cas, proto zde pro ne neprizpusobujeme chovani
        // nejdriv zobraz nacitani, behem ktereho pro vybraneho klienta/skupinu pripravis vychozi hodnoty kurzu, data a casu,
        // pak klienta/skupinu (a tato data) teprve uloz (diky tomu se az pak zobrazi formular) a nacitani skryj pro priste
        this.setState({ IS_LOADING: true }, () => {
            const request = getLecturesForGroupingByCourses(obj.id, this.state.IS_CLIENT)
            request.then(lectures => {
                const lecturesGroupedByCourses = groupByCourses(lectures)
                this.setState(
                    prevState => ({
                        defaultValuesForLecture: getDefaultValuesForLecture(
                            lecturesGroupedByCourses
                        )
                    }),
                    () =>
                        this.setState({
                            object: obj,
                            IS_LOADING: false
                        })
                )
            })
        })
    }

    toggleModalSelect = () => {
        this.setState({ IS_CLIENT: undefined })
    }

    getClientsAfterAddition = newClient => {
        this.setState({ object: newClient })
        this.props.clientsActiveContext.funcHardRefresh()
    }

    getGroupsAfterAddition = newGroup => {
        this.setState({ object: newGroup })
        this.props.groupsActiveContext.funcHardRefresh()
    }

    refreshAfterSave = () => {
        this.setState({
            IS_CLIENT: undefined,
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
                <div className="ModalLecturesFast">
                    <UncontrolledButtonDropdown
                        direction={this.props.direction}
                        className={this.props.className}>
                        <DropdownToggle
                            caret
                            size={this.props.size}
                            id={"ModalLecturesFast" + (this.props.date || "")}
                            color="info">
                            <FontAwesomeIcon icon={faPlus} size="lg" />
                        </DropdownToggle>
                        <UncontrolledTooltip target={"ModalLecturesFast" + (this.props.date || "")}>
                            {title}
                        </UncontrolledTooltip>
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
                    isOpen={this.state.IS_CLIENT !== undefined && this.state.object === null}
                    toggle={this.toggleModalSelect}
                    autoFocus={false}>
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
                                            "Vypočítávám optimální kurz pro klienta"
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
                                                    refresh={this.getClientsAfterAddition}
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
                                                    refresh={this.getGroupsAfterAddition}
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
                <ModalLecturesPlain
                    defaultValuesForLecture={this.state.defaultValuesForLecture}
                    date={this.props.date || ""}
                    object={this.state.object}
                    isModal={this.state.object !== null}
                    toggleModal={this.toggleModal}
                    refresh={this.refreshAfterSave}
                    IS_CLIENT={this.state.IS_CLIENT}
                />
            </Fragment>
        )
    }
}

export default WithClientsActiveContext(WithGroupsActiveContext(ModalLecturesFast))
