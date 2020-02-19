import React, { Component } from "react"
import {
    Alert,
    Col,
    CustomInput,
    Form,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
    Label,
    ModalBody,
    ModalFooter,
    ModalHeader
} from "reactstrap"
import ClientService from "../api/services/client"
import CancelButton from "../components/buttons/CancelButton"
import DeleteButton from "../components/buttons/DeleteButton"
import SubmitButton from "../components/buttons/SubmitButton"
import ClientName from "../components/ClientName"
import Tooltip from "../components/Tooltip"
import { capitalizeString, prettyPhone } from "../global/utils"

/** Formulář pro klienty. */
export default class FormClients extends Component {
    isClient = Boolean(Object.keys(this.props.client).length)

    state = {
        id: this.props.client.id || "",
        firstname: this.props.client.firstname || "",
        surname: this.props.client.surname || "",
        email: this.props.client.email || "",
        phone: prettyPhone(this.props.client.phone) || "",
        note: this.props.client.note || "",
        active: this.isClient ? this.props.client.active : true,
        IS_SUBMIT: false
    }

    onChange = e => {
        this.props.setFormDirty()
        const target = e.target
        let value = target.type === "checkbox" ? target.checked : target.value
        // pri psani rozdeluj cislo na trojice
        if (target.id === "phone")
            value = value
                .replace(/([0-9]{3})([^\s])/, "$1 $2")
                .replace(/([0-9]{3}) ([0-9]{3})([^\s])/, "$1 $2 $3")
        // nastav velke pocatecni pismeno ve jmenu i prijmeni klienta
        else if (target.id === "firstname" || target.id === "surname")
            value = capitalizeString(value)
        this.setState({ [target.id]: value })
    }

    onSubmit = e => {
        // stopPropagation, aby nedoslo k propagaci submit na nadrazene formulare pri vnoreni modalnich oken
        e.stopPropagation()
        e.preventDefault()
        const { id, firstname, surname, email, phone, note, active } = this.state
        const data = { id, firstname, surname, email, phone, note, active }
        let request
        if (this.isClient) request = ClientService.update(data)
        else request = ClientService.create(data)
        this.setState({ IS_SUBMIT: true }, () =>
            request
                .then(response => {
                    this.props.sendResult && this.props.funcProcessAdditionOfClient(response)
                    this.props.funcForceClose(true, { active: response.active, isDeleted: false })
                })
                .catch(() => this.setState({ IS_SUBMIT: false }))
        )
    }

    close = () => this.props.funcClose()

    delete = id =>
        ClientService.remove(id).then(() =>
            this.props.funcForceClose(true, { active: this.state.active, isDeleted: true })
        )

    render() {
        const { id, firstname, surname, email, phone, note, active } = this.state
        return (
            <Form onSubmit={this.onSubmit} data-qa="form_client">
                <ModalHeader toggle={this.close}>
                    {this.isClient ? "Úprava" : "Přidání"} klienta:{" "}
                    <ClientName client={{ firstname, surname }} bold />
                </ModalHeader>
                <ModalBody>
                    <FormGroup row className="required">
                        <Label for="firstname" sm={2}>
                            Jméno
                        </Label>
                        <Col sm={10}>
                            <Input
                                type="text"
                                id="firstname"
                                value={firstname}
                                onChange={this.onChange}
                                required
                                autoFocus
                                data-qa="client_field_firstname"
                                spellCheck
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup row className="required">
                        <Label for="surname" sm={2}>
                            Příjmení
                        </Label>
                        <Col sm={10}>
                            <Input
                                type="text"
                                id="surname"
                                value={surname}
                                onChange={this.onChange}
                                required
                                data-qa="client_field_surname"
                                spellCheck
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="email" sm={2}>
                            Email
                        </Label>
                        <Col sm={10}>
                            <Input
                                type="email"
                                id="email"
                                value={email}
                                onChange={this.onChange}
                                data-qa="client_field_email"
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="phone" sm={2}>
                            Telefon
                        </Label>
                        <Col sm={10}>
                            <InputGroup>
                                <InputGroupAddon addonType="prepend">
                                    <Label className="input-group-text" for="phone">
                                        +420
                                    </Label>
                                </InputGroupAddon>
                                <Input
                                    type="tel"
                                    id="phone"
                                    value={phone}
                                    maxLength="11"
                                    onChange={this.onChange}
                                    pattern="[0-9]{3} [0-9]{3} [0-9]{3}"
                                    data-qa="client_field_phone"
                                />
                            </InputGroup>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="note" sm={2}>
                            Poznámka
                        </Label>
                        <Col sm={10}>
                            <Input
                                type="textarea"
                                id="note"
                                value={note}
                                onChange={this.onChange}
                                data-qa="client_field_note"
                                spellCheck
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup row className="align-items-center">
                        <Label for="active" sm={2} data-qa="client_label_active">
                            Aktivní
                        </Label>
                        <Col sm={10}>
                            <CustomInput
                                type="checkbox"
                                id="active"
                                checked={active}
                                label="Je aktivní"
                                onChange={this.onChange}
                                data-qa="client_checkbox_active"
                            />{" "}
                            {!active && (
                                <Tooltip
                                    postfix="active"
                                    text="Neaktivním klientům nelze vytvořit lekci (ani skupinovou)."
                                />
                            )}
                        </Col>
                    </FormGroup>
                    {this.isClient && (
                        <FormGroup row className="border-top pt-3">
                            <Label sm={2} className="text-muted">
                                Smazání
                            </Label>
                            <Col sm={10}>
                                <Alert color="warning">
                                    <p>
                                        Klienta lze smazat pouze pokud nemá žádné lekce, smažou se
                                        také všechny jeho zájmy o kurzy a členství ve skupinách
                                    </p>
                                    <DeleteButton
                                        content="klienta"
                                        onClick={() => {
                                            if (
                                                window.confirm(
                                                    `Opravdu chcete smazat klienta ${firstname} ${surname}?`
                                                )
                                            )
                                                this.delete(id)
                                        }}
                                        data-qa="button_delete_client"
                                    />
                                </Alert>
                            </Col>
                        </FormGroup>
                    )}
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={this.close} />{" "}
                    <SubmitButton
                        loading={this.state.IS_SUBMIT}
                        data-qa="button_submit_client"
                        content={this.isClient ? "Uložit" : "Přidat"}
                    />
                </ModalFooter>
            </Form>
        )
    }
}
