import * as React from "react"
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
    ModalHeader,
} from "reactstrap"

import { useCreateClient, useDeleteClient, useUpdateClient } from "../api/hooks"
import CancelButton from "../components/buttons/CancelButton"
import DeleteButton from "../components/buttons/DeleteButton"
import SubmitButton from "../components/buttons/SubmitButton"
import ClientName from "../components/ClientName"
import Tooltip from "../components/Tooltip"
import { TEXTS } from "../global/constants"
import { capitalizeString, prettyPhone } from "../global/utils"
import { ModalClientsData } from "../types/components"
import { ClientPostApiDummy, ClientType } from "../types/models"
import { fEmptyVoid } from "../types/types"

type Props = {
    /** Klient. */
    client: ClientType | ClientPostApiDummy
    /** Funkce, která zavře modální okno s formulářem (když uživatel chce explicitně formulář zavřít). */
    funcClose: () => boolean
    /** Funkce, která zavře modální okno s formulářem (po úspěšně provedeném požadavku v rámci formuláře). */
    funcForceClose: (modalSubmitted?: boolean, data?: ModalClientsData) => boolean
    /** Funkce, která se volá při změně údajů ve formuláři. */
    setFormDirty: fEmptyVoid
    /** Funkce, která se zavolá po úspěšném přidání klienta (spolu s daty o klientovi). */
    funcProcessAdditionOfClient?: (newClient: ClientType) => void
}

/** Formulář pro klienty. */
const FormClients: React.FC<Props> = (props) => {
    const isClient = (client: Props["client"]): client is ClientType => "id" in client

    const createClient = useCreateClient()
    const updateClient = useUpdateClient()
    const deleteClient = useDeleteClient()

    /** Křestní jméno klienta. */
    const [firstname, setFirstname] = React.useState(props.client.firstname)
    /** Příjmení klienta. */
    const [surname, setSurname] = React.useState(props.client.surname)
    /** E-mail klienta. */
    const [email, setEmail] = React.useState(props.client.email)
    /** Telefonní číslo klienta. */
    const [phone, setPhone] = React.useState(prettyPhone(props.client.phone))
    /** Poznámka ke klientovi. */
    const [note, setNote] = React.useState(props.client.note)
    /** Klient je aktivní (true). */
    const [active, setActive] = React.useState(props.client.active)

    const onChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>): void => {
            props.setFormDirty()
            const target = e.currentTarget
            let value = target.type === "checkbox" ? target.checked : target.value
            // pri psani rozdeluj cislo na trojice
            if (target.id === "phone") {
                value = (value as string)
                    .replace(/([0-9]{3})([^\s])/, "$1 $2")
                    .replace(/([0-9]{3}) ([0-9]{3})([^\s])/, "$1 $2 $3")
                setPhone(value)
            }
            // nastav velke pocatecni pismeno ve jmenu i prijmeni klienta
            else if (target.id === "firstname") {
                value = capitalizeString(value as string)
                setFirstname(value)
            } else if (target.id === "surname") {
                value = capitalizeString(value as string)
                setSurname(value)
            } else if (target.id === "email") {
                setEmail(value as string)
            } else if (target.id === "note") {
                setNote(value as string)
            } else if (target.id === "active") {
                setActive(value as boolean)
            }
        },
        [props],
    )

    const onSubmit = React.useCallback(
        (e: React.FormEvent<HTMLFormElement>): void => {
            // stopPropagation, aby nedoslo k propagaci submit na nadrazene formulare pri vnoreni modalnich oken
            e.stopPropagation()
            e.preventDefault()
            const dataPost = { firstname, surname, email, phone, note, active }

            if (isClient(props.client)) {
                const dataPut = { ...dataPost, id: props.client.id }
                updateClient.mutate(dataPut, {
                    onSuccess: (response) => {
                        if (props.funcProcessAdditionOfClient) {
                            props.funcProcessAdditionOfClient(response)
                        }
                        props.funcForceClose(true, { active: response.active, isDeleted: false })
                    },
                })
            } else {
                createClient.mutate(dataPost, {
                    onSuccess: (response) => {
                        if (props.funcProcessAdditionOfClient) {
                            props.funcProcessAdditionOfClient(response)
                        }
                        props.funcForceClose(true, { active: response.active, isDeleted: false })
                    },
                })
            }
        },
        [firstname, surname, email, phone, note, active, props, createClient, updateClient],
    )

    const close = React.useCallback((): void => {
        props.funcClose()
    }, [props])

    const handleDelete = React.useCallback(
        (id: ClientType["id"]): void => {
            deleteClient.mutate(id, {
                onSuccess: () => {
                    props.funcForceClose(true, { active, isDeleted: true })
                },
            })
        },
        [deleteClient, props, active],
    )

    const isSubmit = createClient.isPending || updateClient.isPending
    return (
        <Form onSubmit={onSubmit} data-qa="form_client">
            <ModalHeader toggle={close}>
                {isClient(props.client) ? "Úprava" : "Přidání"} klienta:{" "}
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
                            onChange={onChange}
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
                            onChange={onChange}
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
                            onChange={onChange}
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
                                onChange={onChange}
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
                            onChange={onChange}
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
                            onChange={onChange}
                            data-qa="client_checkbox_active"
                        />{" "}
                        {!active && (
                            <Tooltip postfix="active" text={TEXTS.WARNING_INACTIVE_CLIENT_INFO} />
                        )}
                    </Col>
                </FormGroup>
                {isClient(props.client) && (
                    <FormGroup row className="border-top pt-3">
                        <Label sm={2} className="text-muted">
                            Smazání
                        </Label>
                        <Col sm={10}>
                            <Alert color="warning">
                                <p>
                                    Klienta lze smazat pouze pokud nemá žádné lekce, smažou se také
                                    všechny jeho zájmy o kurzy a členství ve skupinách
                                </p>
                                <DeleteButton
                                    content="klienta"
                                    onClick={(): void => {
                                        if (
                                            isClient(props.client) &&
                                            window.confirm(
                                                `Opravdu chcete smazat klienta ${firstname} ${surname}?`,
                                            )
                                        ) {
                                            handleDelete(props.client.id)
                                        }
                                    }}
                                    data-qa="button_delete_client"
                                />
                            </Alert>
                        </Col>
                    </FormGroup>
                )}
            </ModalBody>
            <ModalFooter>
                <CancelButton onClick={close} />{" "}
                <SubmitButton
                    loading={isSubmit}
                    data-qa="button_submit_client"
                    content={isClient(props.client) ? "Uložit" : "Přidat"}
                />
            </ModalFooter>
        </Form>
    )
}

export default FormClients
