import * as React from "react"
import { Modal } from "reactstrap"
import { DefaultValuesForLecture } from "../global/utils"
import useModal from "../hooks/useModal"
import { ClientType, GroupType, LectureType } from "../types/models"
import { fEmptyVoid } from "../types/types"
import FormLectures from "./FormLectures"
import { DummyLecture } from "./helpers/dummies"

type Props = {
    currentLecture?: LectureType
    defaultValuesForLecture?: DefaultValuesForLecture
    refresh?: fEmptyVoid
    object?: ClientType | GroupType | null
    funcCloseCallback: fEmptyVoid
    shouldModalOpen?: boolean
    date?: string
}

/**
 * Jádro modálního okna s formulářem pro lekce.
 * Má na starosti samotnou práci s modálním oknem a je přepoužíváno v různých kontextech.
 */
const ModalLecturesCore: React.FC<Props> = ({
    currentLecture,
    refresh,
    object,
    defaultValuesForLecture,
    funcCloseCallback,
    shouldModalOpen = false,
    date = "",
}) => {
    const [
        isModal,
        toggleModal,
        toggleModalForce,
        setFormDirty,
        setModal,
        processOnModalClose,
    ] = useModal()

    function onModalClose(): void {
        processOnModalClose(refresh)
    }

    function funcWrapper(func: () => boolean): void {
        func() && funcCloseCallback()
    }

    React.useEffect(() => {
        setModal(shouldModalOpen)
    }, [shouldModalOpen, setModal])

    // komponente muze prijit object=null (pri zavirani v ModalLecturesWizard), proto osetreni "object &&"
    return (
        <Modal
            isOpen={isModal}
            toggle={(): void => funcWrapper(toggleModal)}
            size="lg"
            className="ModalFormLecture"
            onClosed={onModalClose}>
            {object && (
                <FormLectures
                    lecture={currentLecture ? currentLecture : DummyLecture}
                    object={object}
                    date={date}
                    defaultValuesForLecture={defaultValuesForLecture}
                    funcClose={(): void => {
                        funcWrapper(toggleModal)
                    }}
                    funcForceClose={(): void => {
                        funcWrapper(toggleModalForce)
                    }}
                    setFormDirty={setFormDirty}
                />
            )}
        </Modal>
    )
}

export default ModalLecturesCore
