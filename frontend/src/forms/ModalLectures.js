import React, {Fragment} from "react"
import {Modal} from "reactstrap"
import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import useModal from "../hooks/useModal"
import FormLectures from "./FormLectures"

const ModalLectures = ({currentLecture = null, refresh, object, IS_CLIENT, defaultCourse}) => {
    const [isModal, toggleModal] = useModal()

    return (
        <Fragment>
            {Boolean(currentLecture) &&
            <EditButton content="Upravit lekci" onClick={toggleModal} data-qa="button_edit_lecture"/>}
            {!Boolean(currentLecture) && <AddButton content="Přidat lekci" onClick={toggleModal}
                                                    data-qa="button_add_lecture"/>}
            <Modal isOpen={isModal} toggle={toggleModal} size="lg" className="ModalFormLecture">
                <FormLectures lecture={Boolean(currentLecture) ? currentLecture : {}}
                              funcClose={toggleModal} object={object}
                              funcRefresh={refresh} IS_CLIENT={IS_CLIENT}
                              defaultCourse={defaultCourse}/>
            </Modal>
        </Fragment>
    )
}

export default ModalLectures
