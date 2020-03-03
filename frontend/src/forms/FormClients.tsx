import * as React from "react"
import { ChangeEvent, FormEvent } from "react"
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
import { ModalClientsData } from "../types/components"
import { ClientPostApiDummy, ClientType } from "../types/models"
import { fEmptyVoid } from "../types/types"

type Props = {
    client: ClientType | ClientPostApiDummy
    funcClose: () => boolean
    funcForceClose: (modalSubmitted?: boolean, data?: ModalClientsData) => boolean
    setFormDirty: fEmptyVoid
    funcProcessAdditionOfClient?: (newClient: ClientType) => void
}

type State = {
    firstname: ClientPostApiDummy["firstname"]
    surname: ClientPostApiDummy["surname"]
    email: ClientPostApiDummy["email"]
    phone: ClientPostApiDummy["phone"]
    note: ClientPostApiDummy["note"]
    active: ClientPostApiDummy["active"]
    isSubmit: boolean
}

/** Formulář pro klienty. */
export default class FormClients extends React.Component<Props, State> {
    isClient = (client: Props["client"]): client is ClientType => "id" in client

    state: State = {
        firstname: this.props.client.firstname,
        surname: this.props.client.surname,
        email: this.props.client.email,
        phone: prettyPhone(this.props.client.phone),
        note: this.props.client.note,
        active: this.props.client.active,
        isSubmit: false
    }

    onChange = (e: ChangeEvent<HTMLInputElement>): void => {
        this.props.setFormDirty()
        const target = e.currentTarget
        let value = target.type === "checkbox" ? target.checked : target.value
        // pri psani rozdeluj cislo na trojice
        if (target.id === "phone")
            value = (value as string)
                .replace(/([0-9]{3})([^\s])/, "$1 $2")
                .replace(/([0-9]{3}) ([0-9]{3})([^\s])/, "$1 $2 $3")
        // nastav velke pocatecni pismeno ve jmenu i prijmeni klienta
        else if (target.id === "firstname" || target.id === "surname")
            value = capitalizeString(value as string)
        // prevState kvuli https://github.com/Microsoft/TypeScript/issues/13948
        this.setState(prevState => ({
            ...prevState,
            [target.id]: value
        }))
    }

    onSubmit = (e: FormEvent<HTMLFormElement>): void => {
        // stopPropagation, aby nedoslo k propagaci submit na nadrazene formulare pri vnoreni modalnich oken
        e.stopPropagation()
        e.preventDefault()
        const { firstname, surname, email, phone, note, active } = this.state
        let request: Promise<ClientType>
        const dataPost = { firstname, surname, email, phone, note, active }
        if (this.isClient(this.props.client)) {
            const dataPut = { ...dataPost, id: this.props.client.id }
            request = ClientService.update(dataPut)
        } else {
            request = ClientService.create(dataPost)
        }
        this.setState({ isSubmit: true }, (): void => {
            request
                .then(response => {
                    this.props.funcProcessAdditionOfClient &&
                        this.props.funcProcessAdditionOfClient(response)
                    this.props.funcForceClose(true, { active: response.active, isDeleted: false })
                })
                .catch(() => this.setState({ isSubmit: false }))
        })
    }

    close = (): void => {
        this.props.funcClose()
    }

    delete = (id: ClientType["id"]): void => {
        ClientService.remove(id).then(() =>
            this.props.funcForceClose(true, { active: this.state.active, isDeleted: true })
        )
    }

    render(): React.ReactNode {
        const { firstname, surname, email, phone, note, active } = this.state
        return (
            <Form onSubmit={this.onSubmit} data-qa="form_client">
                <ModalHeader toggle={this.close}>
                    {this.isClient(this.props.client) ? "Úprava" : "Přidání"} klienta:{" "}
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
                                    maxLength={11}
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
                    {this.isClient(this.props.client) && (
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
                                        onClick={(): void => {
                                            if (
                                                this.isClient(this.props.client) &&
                                                window.confirm(
                                                    `Opravdu chcete smazat klienta ${firstname} ${surname}?`
                                                )
                                            )
                                                this.delete(this.props.client.id)
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
                        loading={this.state.isSubmit}
                        data-qa="button_submit_client"
                        content={this.isClient(this.props.client) ? "Uložit" : "Přidat"}
                    />
                </ModalFooter>
            </Form>
        )
    }
}
