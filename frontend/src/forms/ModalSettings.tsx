import * as React from "react"
import { Modal } from "reactstrap"
import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import { AttendanceStatesContext } from "../contexts/AttendanceStatesContext"
import { CoursesVisibleContext } from "../contexts/CoursesVisibleContext"
import { GroupsActiveContext } from "../contexts/GroupsActiveContext"
import { EDIT_TYPE } from "../global/constants"
import useModal from "../hooks/useModal"
import { AttendanceStateType, CourseType } from "../types/models"
import FormSettings from "./FormSettings"
import { DummyAttendanceState, DummyCourse } from "./helpers/dummies"

type Props = {
    currentObject?: CourseType | AttendanceStateType
    TYPE: number
    refresh: (type: number) => void
}

/** Modální okno s formulářem pro kurzy a stavy účasti. Včetně tlačítek pro vyvolání přidání/úpravy. */
const ModalSettings: React.FC<Props> = ({ currentObject, TYPE, refresh }) => {
    const [isModal, toggleModal, toggleModalForce, setFormDirty, , processOnModalClose] = useModal()
    const typeButtons = TYPE === EDIT_TYPE.COURSE ? "kurz" : "stav účasti"
    const typeQa = TYPE === EDIT_TYPE.COURSE ? "course" : "attendancestate"

    const coursesVisibleContext = React.useContext(CoursesVisibleContext)
    const groupsActiveContext = React.useContext(GroupsActiveContext)
    const attendanceStatesContext = React.useContext(AttendanceStatesContext)

    function onModalClose(): void {
        processOnModalClose(() => {
            // parametr TYPE oznacuje, s cim jsme pracoval ve formulari
            refresh(TYPE)
            if (TYPE === EDIT_TYPE.COURSE) {
                coursesVisibleContext.funcHardRefresh()
                // je potreba take projevit zmeny kurzu do seznamu aktivnich skupin
                groupsActiveContext.funcHardRefresh()
            } else if (TYPE === EDIT_TYPE.STATE) {
                attendanceStatesContext.funcRefresh()
            }
        })
    }

    return (
        <>
            {currentObject ? (
                <EditButton
                    contentId={typeQa + currentObject.id}
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
                        currentObject
                            ? currentObject
                            : TYPE === EDIT_TYPE.COURSE
                            ? DummyCourse
                            : DummyAttendanceState
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
