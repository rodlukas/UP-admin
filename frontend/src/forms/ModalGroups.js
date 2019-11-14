import React, { Fragment } from "react"
import { Modal } from "reactstrap"
import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import useModal from "../hooks/useModal"
import FormGroups from "./FormGroups"

const ModalGroups = ({ currentGroup = null, sendResult = false, inSentence = false, refresh }) => {
    const [isModal, toggleModal] = useModal()

    return (
        <Fragment>
            {Boolean(currentGroup) && (
                <EditButton
                    content_id={currentGroup.id}
                    content="Upravit skupinu"
                    onClick={toggleModal}
                    data-qa="button_edit_group"
                />
            )}
            {!Boolean(currentGroup) && (
                <AddButton
                    content={(inSentence ? "přidejte novou" : "Přidat") + " skupinu"}
                    small={inSentence}
                    onClick={toggleModal}
                    data-qa="button_add_group"
                />
            )}
            <Modal isOpen={isModal} toggle={toggleModal} autoFocus={false}>
                <FormGroups
                    group={Boolean(currentGroup) ? currentGroup : {}}
                    funcClose={toggleModal}
                    funcRefresh={refresh}
                    sendResult={sendResult}
                />
            </Modal>
        </Fragment>
    )
}

export default ModalGroups
