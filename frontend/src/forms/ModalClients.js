import React, { Fragment, useContext } from "react"
import { Modal } from "reactstrap"
import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import { ClientsActiveContext } from "../contexts/ClientsActiveContext"
import { GroupsActiveContext } from "../contexts/GroupsActiveContext"
import FormClients from "../forms/FormClients"
import useModal from "../hooks/useModal"

const ModalClients = ({
    currentClient = null,
    sendResult = false,
    inSentence = false,
    processAdditionOfClient,
    refresh = () => {}
}) => {
    const [
        isModal,
        toggleModal,
        toggleModalForce,
        setFormDirty,
        ,
        processOnModalClose,
        tempData
    ] = useModal()

    const clientsActiveContext = useContext(ClientsActiveContext)
    const groupsActiveContext = useContext(GroupsActiveContext)

    function onModalClose() {
        processOnModalClose(() => {
            refresh(tempData)
            // projeveni zmen do aktivnich klientu
            clientsActiveContext.funcHardRefresh()
            // Je potreba projevit zmeny i pro cleny skupin, ALE POUZE kdyz se data
            // nepredavaji dal!!!
            // Tyka se komponenty Groups a zde upravy skupiny (ne pridani).
            // Duvod: obsahuje puvodni formular, ale take je zavisla na
            // groupsActiveContext - kvuli tomu se prekresli a tim padem se aktualni
            // formulare unmountnou z DOMu. U pridani ne, protoze tam se formular
            // pouze prekresli a nezavre.
            !sendResult && groupsActiveContext.funcHardRefresh()
        })
    }

    return (
        <Fragment>
            {Boolean(currentClient) && (
                <EditButton
                    content_id={currentClient.id}
                    content="Upravit klienta"
                    onClick={toggleModal}
                    data-qa="button_edit_client"
                />
            )}
            {!Boolean(currentClient) && (
                <AddButton
                    content={`${inSentence ? "přidejte nového" : "Přidat"} klienta`}
                    small={inSentence}
                    onClick={toggleModal}
                    data-qa="button_add_client"
                />
            )}
            <Modal isOpen={isModal} toggle={toggleModal} autoFocus={false} onClosed={onModalClose}>
                <FormClients
                    client={Boolean(currentClient) ? currentClient : {}}
                    funcClose={toggleModal}
                    funcForceClose={toggleModalForce}
                    setFormDirty={setFormDirty}
                    funcProcessAdditionOfClient={processAdditionOfClient}
                    sendResult={sendResult}
                />
            </Modal>
        </Fragment>
    )
}

export default ModalClients
