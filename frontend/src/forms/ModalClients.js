import React, { Fragment } from "react"
import { Modal } from "reactstrap"
import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import FormClients from "../forms/FormClients"
import useModal from "../hooks/useModal"

const ModalClients = ({
    currentClient = null,
    sendResult = false,
    inSentence = false,
    refresh
}) => {
    const [isModal, toggleModal] = useModal()

    return (
        <Fragment>
            {Boolean(currentClient) && (
                <EditButton
                    content="Upravit klienta"
                    onClick={toggleModal}
                    data-qa="button_edit_client"
                />
            )}
            {!Boolean(currentClient) && (
                <AddButton
                    content={(inSentence ? "přidejte nového" : "Přidat") + " klienta"}
                    small={inSentence}
                    onClick={toggleModal}
                    data-qa="button_add_client"
                />
            )}
            <Modal isOpen={isModal} toggle={toggleModal} autoFocus={false}>
                <FormClients
                    client={Boolean(currentClient) ? currentClient : {}}
                    funcClose={toggleModal}
                    funcRefresh={refresh}
                    sendResult={sendResult}
                />
            </Modal>
        </Fragment>
    )
}

export default ModalClients
