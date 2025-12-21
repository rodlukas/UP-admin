import * as React from "react"
import { Modal } from "reactstrap"

import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import useModal from "../hooks/useModal"
import { ApplicationType } from "../types/models"

import FormApplications from "./FormApplications"
import { DummyApplication } from "./helpers/dummies"

type Props = {
    /** Zájemce o kurz. */
    currentApplication?: ApplicationType
}

/** Modální okno s formulářem pro zájemce o kurzy. */
const ModalApplications: React.FC<Props> = ({ currentApplication }) => {
    const [isModal, toggleModal, toggleModalForce, setFormDirty, , processOnModalClose] = useModal()

    return (
        <>
            {currentApplication ? (
                <EditButton
                    contentId={currentApplication.id}
                    content="Upravit zájemce"
                    onClick={toggleModal}
                    data-qa="button_edit_application"
                />
            ) : (
                <AddButton
                    content="Přidat zájemce"
                    onClick={toggleModal}
                    data-qa="button_add_application"
                />
            )}
            <Modal
                isOpen={isModal}
                toggle={toggleModal}
                autoFocus={false}
                onClosed={processOnModalClose}>
                <FormApplications
                    application={currentApplication ?? DummyApplication}
                    funcClose={toggleModal}
                    funcForceClose={toggleModalForce}
                    setFormDirty={setFormDirty}
                />
            </Modal>
        </>
    )
}

export default ModalApplications
