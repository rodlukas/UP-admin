import React, { Fragment } from "react"
import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import useModal from "../hooks/useModal"
import ModalLecturesPlain from "./ModalLecturesPlain"

const ModalLectures = ({
    currentLecture = null,
    refresh,
    object,
    IS_CLIENT,
    defaultValuesForLecture
}) => {
    const [isModal, toggleModal] = useModal()

    return (
        <Fragment>
            {Boolean(currentLecture) && (
                <EditButton
                    content_id={currentLecture.id}
                    content="Upravit lekci"
                    onClick={toggleModal}
                    data-qa="button_edit_lecture"
                />
            )}
            {!Boolean(currentLecture) && (
                <AddButton
                    content="Přidat lekci"
                    onClick={toggleModal}
                    data-qa="button_add_lecture"
                />
            )}
            <ModalLecturesPlain
                isModal={isModal}
                toggleModal={toggleModal}
                currentLecture={currentLecture}
                refresh={refresh}
                object={object}
                IS_CLIENT={IS_CLIENT}
                defaultValuesForLecture={defaultValuesForLecture}
            />
        </Fragment>
    )
}

export default ModalLectures
