import {faPlus} from "@fortawesome/pro-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import React, {Fragment} from "react"
import Select from "react-select"
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Modal,
    ModalBody,
    ModalHeader,
    UncontrolledButtonDropdown,
} from "reactstrap"
import GroupService from "../api/services/group"
import Loading from "../components/Loading"
import {WithClientsActiveContext} from "../contexts/ClientsActiveContext"
import {TEXTS} from "../global/constants"
import {prettyDate} from "../global/funcDateTime"
import {getDefaultCourse, getLecturesForGroupingByCourses, groupByCourses} from "../global/utils"
import {react_select_ids} from "./helpers/func"
import Or from "./helpers/Or"
import SelectClient from "./helpers/SelectClient"
import ModalClients from "./ModalClients"
import ModalGroups from "./ModalGroups"
import ModalLecturesPlain from "./ModalLecturesPlain"

class ModalLecturesFast extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            IS_MODAL: true,
            IS_CLIENT: undefined,
            IS_MODAL_SELECT: true,
            object: null,
            groups: [],
            defaultCourse: null,
            IS_LOADING: false
        }
    }

    setClient(IS_CLIENT) {
        if (IS_CLIENT)
            this.props.clientsActiveContext.funcRefresh()
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
        // pokud se jedna o skupinu, jen ji uloz (je zbytecne resit defaultCourse, skupina ma kurz jasny)
        if (!this.state.IS_CLIENT)
            this.setState({object: obj})
        else {
            // jedna se o klienta, nejdriv zobraz nacitani, behem ktereho pro nej pripravis nejoptimalnejsi vychozi kurz,
            // pak klienta (a kurz) teprve uloz (diky tomu se az pak zobrazi formular) a nacitani skryj pro priste
            this.setState({IS_LOADING: true}, () => {
                const request = getLecturesForGroupingByCourses(obj.id, this.state.IS_CLIENT)
                request.then(lectures => {
                    const lecturesGroupedByCourses = groupByCourses(lectures)
                    this.setState({defaultCourse: getDefaultCourse(lecturesGroupedByCourses, this.state.IS_CLIENT),}, () =>
                        this.setState({
                            object: obj,
                            IS_LOADING: false
                        }))
                })
            })
        }
    }

    toggleModalSelect = () => {
        this.setState({IS_CLIENT: undefined})
    }

    getGroups = () =>
        GroupService.getActive()
            .then(groups => this.setState({groups}))

    componentDidMount() {
        this.getGroups()
    }

    getClientsAfterAddition = newClient => {
        this.setState({object: newClient})
        this.props.clientsActiveContext.funcHardRefresh()
    }

    getGroupsAfterAddition = newGroup =>
        GroupService.getActive()
            .then(groups => this.setState({groups, object: newGroup}))

    refreshAfterSave = () => {
        this.setState({
            IS_CLIENT: undefined,
            object: null,
            IS_MODAL_SELECT: true
        })
        this.props.refresh()
    }

    render() {
        let title = "Přidat lekci"
        if (this.props.date)
            title += " na " + prettyDate(new Date(this.props.date))
        return (
            <Fragment>
                <UncontrolledButtonDropdown direction={this.props.direction} className={this.props.className}>
                    <DropdownToggle caret size={this.props.size} title={title} color="info">
                        <FontAwesomeIcon icon={faPlus} size="lg"/>
                    </DropdownToggle>
                    <DropdownMenu right>
                        <DropdownItem onClick={() => this.setClient(true)}>
                            přidat lekci <strong>klienta</strong>...
                        </DropdownItem>
                        <DropdownItem onClick={() => this.setClient(false)}>
                            přidat lekci <strong>skupiny</strong>...
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
                {this.state.IS_CLIENT !== undefined &&
                <Modal isOpen={this.state.IS_MODAL_SELECT} toggle={this.toggleModalSelect}>
                    <ModalHeader toggle={this.toggleModalSelect}>
                        Výběr {this.state.IS_CLIENT ? 'klienta' : 'skupiny'}
                    </ModalHeader>
                    <ModalBody>
                        {this.state.IS_LOADING || !this.props.clientsActiveContext.isLoaded ?
                            <Loading text={this.state.IS_LOADING && "Vypočítávám optimální kurz pro klienta"}/>
                            :
                            this.state.IS_CLIENT ?
                                <Fragment>
                                    <SelectClient
                                        value={this.state.object}
                                        options={this.props.clientsActiveContext.clients}
                                        onChangeCallback={this.onSelectChange}/>
                                    <Or content={<ModalClients refresh={this.getClientsAfterAddition} sendResult
                                                               inSentence/>}/>
                                </Fragment>
                                :
                                <Fragment>
                                    <Select
                                        {...react_select_ids("group")}
                                        value={this.state.object}
                                        getOptionLabel={option => option.name}
                                        getOptionValue={option => option.id}
                                        onChange={newValue => this.onSelectChange(newValue)}
                                        options={this.state.groups}
                                        placeholder={"Vyberte existující skupinu..."}
                                        noOptionsMessage={() => TEXTS.NO_RESULTS}
                                        required
                                        autoFocus/>
                                    <Or content={<ModalGroups refresh={this.getGroupsAfterAddition} sendResult
                                                              inSentence/>}/>
                                </Fragment>
                        }
                    </ModalBody>
                </Modal>}
                {this.state.object !== null &&
                <ModalLecturesPlain
                    defaultCourse={this.state.defaultCourse}
                    date={this.props.date || ''}
                    object={this.state.object}
                    isModal={this.state.IS_MODAL}
                    toggleModal={this.toggleModal}
                    refresh={this.refreshAfterSave}
                    IS_CLIENT={this.state.IS_CLIENT}/>}
            </Fragment>
        )
    }
}

export default WithClientsActiveContext(ModalLecturesFast)
