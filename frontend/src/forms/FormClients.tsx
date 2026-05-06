import { Checkbox, Group, Modal, SimpleGrid, Textarea, TextInput, Title } from "@mantine/core"
import * as React from "react"

import { AnalyticsSource, trackEvent } from "../analytics"
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

import * as styles from "./FormBase.css"

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
    /** Identifikace místa, odkud byl formulář otevřen (pro analytiku). */
    source: AnalyticsSource
}

/** Formulář pro klienty. */
const FormClients: React.FC<Props> = (props) => {
    const isClient = (client: Props["client"]): client is ClientType => "id" in client

    const createClient = useCreateClient()
    const updateClient = useUpdateClient()
    const deleteClient = useDeleteClient()

    const [firstname, setFirstname] = React.useState(props.client.firstname)
    const [surname, setSurname] = React.useState(props.client.surname)
    const [email, setEmail] = React.useState(props.client.email)
    const [phone, setPhone] = React.useState(prettyPhone(props.client.phone))
    const [note, setNote] = React.useState(props.client.note)
    const [active, setActive] = React.useState(props.client.active)

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        props.setFormDirty()
        const target = e.currentTarget
        const value = target.value
        if (target.id === "phone") {
            const formatted = value
                .replace(/(\d{3})([^\s])/, "$1 $2")
                .replace(/(\d{3}) (\d{3})([^\s])/, "$1 $2 $3")
            setPhone(formatted)
        } else if (target.id === "firstname") {
            setFirstname(capitalizeString(value))
        } else if (target.id === "surname") {
            setSurname(capitalizeString(value))
        } else if (target.id === "email") {
            setEmail(value)
        } else if (target.id === "note") {
            setNote(value)
        }
    }

    const onActiveChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        props.setFormDirty()
        setActive(e.currentTarget.checked)
    }

    const onSubmit = React.useCallback(
        (e: React.SyntheticEvent<HTMLFormElement>): void => {
            // stopPropagation, aby nedoslo k propagaci submit na nadrazene formulare pri vnoreni modalnich oken
            e.stopPropagation()
            e.preventDefault()
            const dataPost = { firstname, surname, email, phone, note, active }

            if (isClient(props.client)) {
                const dataPut = { ...dataPost, id: props.client.id }
                updateClient.mutate(dataPut, {
                    onSuccess: (response) => {
                        trackEvent("client_updated", { source: props.source })
                        if (props.funcProcessAdditionOfClient) {
                            props.funcProcessAdditionOfClient(response)
                        }
                        props.funcForceClose(true, { active: response.active, isDeleted: false })
                    },
                })
            } else {
                createClient.mutate(dataPost, {
                    onSuccess: (response) => {
                        trackEvent("client_created", { source: props.source })
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

    const close = (): void => {
        props.funcClose()
    }

    const handleDelete = React.useCallback(
        (id: ClientType["id"]): void => {
            deleteClient.mutate(id, {
                onSuccess: () => {
                    trackEvent("client_deleted", { source: props.source })
                    props.funcForceClose(true, { active, isDeleted: true })
                },
            })
        },
        [deleteClient, props, active],
    )

    const isSubmit = createClient.isPending || updateClient.isPending
    return (
        <form onSubmit={onSubmit} data-qa="form_client">
            <Modal.Header>
                <Modal.Title>
                    {isClient(props.client) ? "Úprava" : "Přidání"} klienta:{" "}
                    <ClientName client={{ firstname, surname }} bold />
                </Modal.Title>
                <Modal.CloseButton />
            </Modal.Header>
            <Modal.Body>
                <div className={styles.formContent}>
                    <div className={styles.formSection}>
                        <Title order={6} className={styles.formSectionTitle}>Základní údaje</Title>
                        <div className={styles.fieldStack}>
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                                <div className={styles.fieldBlock}>
                                    <TextInput
                                        id="firstname"
                                        value={firstname}
                                        onChange={onChange}
                                        label="Jméno"
                                        required
                                        
                                        data-autofocus
                                        data-qa="client_field_firstname"
                                        spellCheck
                                    />
                                </div>
                                <div className={styles.fieldBlock}>
                                    <TextInput
                                        id="surname"
                                        value={surname}
                                        onChange={onChange}
                                        label="Příjmení"
                                        required
                                        
                                        data-qa="client_field_surname"
                                        spellCheck
                                    />
                                </div>
                            </SimpleGrid>
                            <div className={styles.fieldBlock}>
                                <TextInput
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={onChange}
                                    label="Email"
                                    data-qa="client_field_email"
                                />
                            </div>
                            <div className={styles.fieldBlock}>
                                <TextInput
                                    type="tel"
                                    id="phone"
                                    value={phone}
                                    maxLength={11}
                                    onChange={onChange}
                                    label="Telefon"
                                    description="Formát: 123 456 789"
                                    pattern="[0-9]{3} [0-9]{3} [0-9]{3}"
                                    data-qa="client_field_phone"
                                    leftSection={<span>+420</span>}
                                />
                            </div>
                            <div className={styles.fieldBlock}>
                                <Textarea
                                    id="note"
                                    value={note}
                                    onChange={onChange}
                                    label="Poznámka"
                                    data-qa="client_field_note"
                                    spellCheck
                                    minRows={3}
                                />
                            </div>
                            <div className={styles.fieldBlock}>
                                <label
                                    htmlFor="active"
                                    data-qa="client_label_active"
                                    className={styles.fieldLabel}>
                                    Stav klienta
                                </label>
                                <div className={styles.inlineCheckboxRow}>
                                    <Checkbox
                                        id="active"
                                        checked={active}
                                        onChange={onActiveChange}
                                        data-qa="client_checkbox_active"
                                        label="Je aktivní"
                                    />
                                    {!active && (
                                        <Tooltip text={TEXTS.WARNING_INACTIVE_CLIENT_INFO} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                {isClient(props.client) && (
                    <div className={`${styles.formSection} ${styles.formSectionDanger}`}>
                        <Title order={6} className={styles.formSectionTitle}>Smazání</Title>
                        <div className={styles.deleteAlertText}>
                            <p>
                                Klienta lze smazat pouze pokud nemá žádné lekce, smažou se také
                                všechny jeho zájmy o kurzy a členství ve skupinách.
                            </p>
                            <DeleteButton
                                size="sm"
                                content="klienta"
                                onClick={(): void => {
                                    if (
                                        isClient(props.client) &&
                                        globalThis.confirm(
                                            `Opravdu chcete smazat klienta ${firstname} ${surname}?`,
                                        )
                                    ) {
                                        handleDelete(props.client.id)
                                    }
                                }}
                                data-qa="button_delete_client"
                            />
                        </div>
                    </div>
                )}
                </div>
            </Modal.Body>
            <Group justify="flex-end" px="md" pb="md" className={styles.modalActions}>
                <CancelButton onClick={close} />
                <SubmitButton
                    loading={isSubmit}
                    data-qa="button_submit_client"
                    content={isClient(props.client) ? "Uložit" : "Přidat"}
                />
            </Group>
        </form>
    )
}

export default FormClients
