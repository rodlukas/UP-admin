import React, { Fragment, useContext } from "react"
import { Modal } from "reactstrap"
import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import { AttendanceStatesContext } from "../contexts/AttendanceStatesContext"
import { CoursesVisibleContext } from "../contexts/CoursesVisibleContext"
import { GroupsActiveContext } from "../contexts/GroupsActiveContext"
import FormSettings from "../forms/FormSettings"
import { EDIT_TYPE } from "../global/constants"
import useModal from "../hooks/useModal"

const ModalSettings = ({ currentObject = null, TYPE, refresh }) => {
    const [isModal, toggleModal, toggleModalForce, setFormDirty, , processOnModalClose] = useModal()
    const type_buttons = TYPE === EDIT_TYPE.COURSE ? "kurz" : "stav účasti"
    const type_qa = TYPE === EDIT_TYPE.COURSE ? "course" : "attendancestate"

    const coursesVisibleContext = useContext(CoursesVisibleContext)
    const groupsActiveContext = useContext(GroupsActiveContext)
    const attendanceStatesContext = useContext(AttendanceStatesContext)

    function onModalClose() {
        processOnModalClose(() => {
            // parametr TYPE oznacuje, s cim jsme pracoval ve formulari
            refresh(TYPE)
            if (TYPE === EDIT_TYPE.COURSE) {
                coursesVisibleContext.funcHardRefresh()
                // je potreba take projevit zmeny kurzu do seznamu aktivnich skupin
                groupsActiveContext.funcHardRefresh()
            } else if (TYPE === EDIT_TYPE.STATE) attendanceStatesContext.funcRefresh()
        })
    }

    return (
        <Fragment>
            {Boolean(currentObject) && (
                <EditButton
                    content_id={type_qa + currentObject.id}
                    content={`Upravit ${type_buttons}`}
                    onClick={toggleModal}
                    data-qa={`button_edit_${type_qa}`}
                />
            )}
            {!currentObject && (
                <AddButton
                    content={`Přidat ${type_buttons}`}
                    onClick={toggleModal}
                    data-qa={`button_add_${type_qa}`}
                />
            )}
            <Modal isOpen={isModal} toggle={toggleModal} autoFocus={false} onClosed={onModalClose}>
                <FormSettings
                    object={currentObject ? currentObject : {}}
                    TYPE={TYPE}
                    funcClose={toggleModal}
                    funcForceClose={toggleModalForce}
                    setFormDirty={setFormDirty}
                />
            </Modal>
        </Fragment>
    )
}

export default ModalSettings
