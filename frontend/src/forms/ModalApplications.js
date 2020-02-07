import React, { Fragment } from "react"
import { Modal } from "reactstrap"
import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import FormApplications from "../forms/FormApplications"
import useModal from "../hooks/useModal"

const ModalApplications = ({ currentApplication = null, refresh }) => {
    const [isModal, toggleModal, toggleModalForce, setFormDirty, , processOnModalClose] = useModal()

    function onModalClose() {
        processOnModalClose(refresh)
    }

    return (
        <Fragment>
            {Boolean(currentApplication) && (
                <EditButton
                    content_id={currentApplication.id}
                    content="Upravit zájemce"
                    onClick={toggleModal}
                    data-qa="button_edit_application"
                />
            )}
            {!Boolean(currentApplication) && (
                <AddButton
                    content="Přidat zájemce"
                    onClick={toggleModal}
                    data-qa="button_add_application"
                />
            )}
            <Modal isOpen={isModal} toggle={toggleModal} autoFocus={false} onClosed={onModalClose}>
                <FormApplications
                    application={Boolean(currentApplication) ? currentApplication : {}}
                    funcClose={toggleModal}
                    funcForceClose={toggleModalForce}
                    setFormDirty={setFormDirty}
                />
            </Modal>
        </Fragment>
    )
}

export default ModalApplications
