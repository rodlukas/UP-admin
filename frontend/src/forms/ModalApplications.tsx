import * as React from "react"
import { Modal } from "reactstrap"

import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import useModal from "../hooks/useModal"
import { ApplicationType } from "../types/models"
import { fEmptyVoid } from "../types/types"

import FormApplications from "./FormApplications"
import { DummyApplication } from "./helpers/dummies"

type Props = {
    /** Zájemce o kurz. */
    currentApplication?: ApplicationType
    /** Funkce, která se zavolá po zavření modálního okna - obnoví data v rodiči. */
    refresh: fEmptyVoid
}

/** Modální okno s formulářem pro zájemce o kurzy. */
const ModalApplications: React.FC<Props> = ({ currentApplication, refresh }) => {
    const [isModal, toggleModal, toggleModalForce, setFormDirty, , processOnModalClose] = useModal()

    function onModalClose(): void {
        processOnModalClose(refresh)
    }

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
            <Modal isOpen={isModal} toggle={toggleModal} autoFocus={false} onClosed={onModalClose}>
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
