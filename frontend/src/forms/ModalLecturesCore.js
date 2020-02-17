import React, { useEffect } from "react"
import { Modal } from "reactstrap"
import useModal from "../hooks/useModal"
import FormLectures from "./FormLectures"

const ModalLecturesCore = ({
    currentLecture = null,
    refresh,
    object,
    IS_CLIENT,
    defaultValuesForLecture,
    funcCloseCallback,
    shouldModalOpen = false,
    date = ""
}) => {
    const [
        isModal,
        toggleModal,
        toggleModalForce,
        setFormDirty,
        setModal,
        processOnModalClose
    ] = useModal()

    function onModalClose() {
        processOnModalClose(refresh)
    }

    function funcWrapper(func) {
        func() && funcCloseCallback()
    }

    useEffect(() => {
        setModal(shouldModalOpen)
    }, [shouldModalOpen, setModal])

    // komponente muze prijit object=null (pri zavirani v ModalLecturesWizard), proto osetreni "object &&"
    return (
        <Modal
            isOpen={isModal}
            toggle={() => funcWrapper(toggleModal)}
            size="lg"
            className="ModalFormLecture"
            onClosed={onModalClose}>
            {object && (
                <FormLectures
                    lecture={currentLecture ? currentLecture : {}}
                    object={object}
                    date={date}
                    IS_CLIENT={IS_CLIENT}
                    defaultValuesForLecture={defaultValuesForLecture}
                    funcClose={() => funcWrapper(toggleModal)}
                    funcForceClose={() => funcWrapper(toggleModalForce)}
                    setFormDirty={setFormDirty}
                />
            )}
        </Modal>
    )
}

export default ModalLecturesCore
