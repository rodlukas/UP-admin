import React, { Fragment } from "react"
import { Modal } from "reactstrap"
import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import FormSettings from "../forms/FormSettings"
import { EDIT_TYPE } from "../global/constants"
import useModal from "../hooks/useModal"

const ModalSettings = ({ currentObject = null, TYPE, refresh }) => {
    const [isModal, toggleModal, toggleModalForce, setFormDirty] = useModal()
    const type_buttons = TYPE === EDIT_TYPE.COURSE ? "kurz" : "stav účasti"
    const type_qa = TYPE === EDIT_TYPE.COURSE ? "course" : "attendancestate"

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
            {!Boolean(currentObject) && (
                <AddButton
                    content={`Přidat ${type_buttons}`}
                    onClick={toggleModal}
                    data-qa={`button_add_${type_qa}`}
                />
            )}
            <Modal isOpen={isModal} toggle={toggleModal} autoFocus={false}>
                <FormSettings
                    object={Boolean(currentObject) ? currentObject : {}}
                    TYPE={TYPE}
                    funcClose={toggleModal}
                    funcForceClose={toggleModalForce}
                    setFormDirty={setFormDirty}
                    funcRefresh={refresh}
                />
            </Modal>
        </Fragment>
    )
}

export default ModalSettings
