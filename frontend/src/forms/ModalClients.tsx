import * as React from "react"
import { Modal } from "reactstrap"

import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import useModal from "../hooks/useModal"
import { ClientType } from "../types/models"

import FormClients from "./FormClients"
import { DummyClient } from "./helpers/dummies"

type Props = {
    /** Klient. */
    currentClient?: ClientType
    /** Tlačítka pro otevření modálního okna jsou součástí vět (pro použití s komponentou Or). */
    withOr?: boolean
    /** Funkce, která se zavolá po úspěšném přidání klienta (spolu s daty o klientovi). */
    processAdditionOfClient?: (newClient: ClientType) => void
    /** Funkce, která se zavolá po zavření modálního okna - obnoví data v rodiči. */
    refresh?: (data: { active?: boolean } | null) => void
}

/** Modální okno s formulářem pro klienty. Včetně tlačítek pro vyvolání přidání/úpravy. */
const ModalClients: React.FC<Props> = ({
    currentClient,
    withOr = false,
    processAdditionOfClient,
    refresh,
}) => {
    const [isModal, toggleModal, toggleModalForce, setFormDirty, , processOnModalClose, tempData] =
        useModal()

    return (
        <>
            {currentClient ? (
                <EditButton
                    contentId={currentClient.id}
                    content="Upravit klienta"
                    onClick={toggleModal}
                    data-qa="button_edit_client"
                />
            ) : (
                <AddButton
                    content={`${withOr ? "přidejte nového" : "Přidat"} klienta`}
                    small={withOr}
                    onClick={toggleModal}
                    data-qa="button_add_client"
                />
            )}
            <Modal
                isOpen={isModal}
                toggle={toggleModal}
                autoFocus={false}
                onClosed={(): void => {
                    processOnModalClose(() => {
                        if (refresh && tempData) {
                            refresh(tempData as { active?: boolean })
                        }
                    })
                }}>
                <FormClients
                    client={currentClient ?? DummyClient}
                    funcClose={toggleModal}
                    funcForceClose={toggleModalForce}
                    setFormDirty={setFormDirty}
                    funcProcessAdditionOfClient={processAdditionOfClient}
                />
            </Modal>
        </>
    )
}

export default ModalClients
