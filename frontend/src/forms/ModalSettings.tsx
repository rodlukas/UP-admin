import * as React from "react"
import { Modal } from "reactstrap"

import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import { EDIT_TYPE } from "../global/constants"
import useModal from "../hooks/useModal"
import { AttendanceStateType, CourseType } from "../types/models"

import FormSettings from "./FormSettings"
import { DummyAttendanceState, DummyCourse } from "./helpers/dummies"

type Props = {
    /** Kurz/stav účasti. */
    currentObject?: CourseType | AttendanceStateType
    /** Indikátor typu objektu (kurz/stav účasti). */
    TYPE: EDIT_TYPE
}

/** Modální okno s formulářem pro kurzy a stavy účasti. Včetně tlačítek pro vyvolání přidání/úpravy. */
const ModalSettings: React.FC<Props> = ({ currentObject, TYPE }) => {
    const [isModal, toggleModal, toggleModalForce, setFormDirty, , processOnModalClose] = useModal()
    const typeButtons = TYPE === EDIT_TYPE.COURSE ? "kurz" : "stav účasti"
    const typeQa = TYPE === EDIT_TYPE.COURSE ? "course" : "attendancestate"

    function onModalClose(): void {
        processOnModalClose()
    }

    return (
        <>
            {currentObject ? (
                <EditButton
                    contentId={`${typeQa}${currentObject.id}`}
                    content={`Upravit ${typeButtons}`}
                    onClick={toggleModal}
                    data-qa={`button_edit_${typeQa}`}
                />
            ) : (
                <AddButton
                    content={`Přidat ${typeButtons}`}
                    onClick={toggleModal}
                    data-qa={`button_add_${typeQa}`}
                />
            )}
            <Modal isOpen={isModal} toggle={toggleModal} autoFocus={false} onClosed={onModalClose}>
                <FormSettings
                    object={
                        currentObject ??
                        (TYPE === EDIT_TYPE.COURSE ? DummyCourse : DummyAttendanceState)
                    }
                    funcClose={toggleModal}
                    funcForceClose={toggleModalForce}
                    setFormDirty={setFormDirty}
                />
            </Modal>
        </>
    )
}

export default ModalSettings
