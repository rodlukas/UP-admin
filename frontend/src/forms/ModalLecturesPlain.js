import React, { useEffect } from "react"
import { Modal } from "reactstrap"
import useModal from "../hooks/useModal"
import FormLectures from "./FormLectures"

const ModalLecturesPlain = ({
    currentLecture = null,
    refresh,
    object,
    IS_CLIENT,
    defaultValuesForLecture,
    funcCloseCallback,
    shouldModalOpen = false,
    date = ""
}) => {
    const [isModal, toggleModal, toggleModalForce, setFormDirty, setModal] = useModal()

    function funcWrapper(func) {
        func() && funcCloseCallback()
    }

    useEffect(() => {
        setModal(shouldModalOpen)
    }, [shouldModalOpen])

    // komponente muze prijit object=null (pri zavirani v ModalLecturesFast), proto osetreni "object &&"
    return (
        <Modal
            isOpen={isModal}
            toggle={() => funcWrapper(toggleModal)}
            size="lg"
            className="ModalFormLecture">
            {object && (
                <FormLectures
                    lecture={Boolean(currentLecture) ? currentLecture : {}}
                    funcRefresh={refresh}
                    object={object}
                    IS_CLIENT={IS_CLIENT}
                    defaultValuesForLecture={defaultValuesForLecture}
                    funcClose={() => funcWrapper(toggleModal)}
                    funcForceClose={() => funcWrapper(toggleModalForce)}
                    setFormDirty={setFormDirty}
                    date={date}
                />
            )}
        </Modal>
    )
}

export default ModalLecturesPlain
