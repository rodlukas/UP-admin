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
import ClientService from "../api/services/client"
import GroupService from "../api/services/group"
import {TEXTS} from "../global/constants"
import {prettyDate} from "../global/funcDateTime"
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
            clients: [],
            groups: []
        }
    }

    setClient(IS_CLIENT) {
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

    onSelectChange = (obj, name = null) =>
        this.setState({
            object: obj
        })

    toggleModalSelect = () => {
        this.setState({IS_CLIENT: undefined})
    }

    getClients = () =>
        ClientService.getActive()
            .then(clients => this.setState({clients}))

    getGroups = () =>
        GroupService.getActive()
            .then(groups => this.setState({groups}))

    componentDidMount() {
        this.getClients()
        this.getGroups()
    }

    getClientsAfterAddition = newClient =>
        ClientService.getActive()
            .then(clients => this.setState({clients, object: newClient}))

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
                        {this.state.IS_CLIENT ?
                            <Fragment>
                                <SelectClient
                                    value={this.state.object}
                                    options={this.state.clients}
                                    onChangeCallback={this.onSelectChange}/>
                                <Or content={<ModalClients refresh={this.getClientsAfterAddition} sendResult
                                                           inSentence/>}/>
                            </Fragment>
                            :
                            <Fragment>
                                <Select
                                    inputId="group"
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
                            </Fragment>}
                    </ModalBody>
                </Modal>}
                {this.state.object !== null &&
                <ModalLecturesPlain
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

export default ModalLecturesFast
