import React, { Fragment, useState } from "react"
import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import ModalLecturesCore from "./ModalLecturesCore"

const ModalLectures = ({
    currentLecture = null,
    refresh,
    object,
    IS_CLIENT,
    defaultValuesForLecture
}) => {
    const [shouldModalOpen, setShouldModalOpen] = useState(false)
    return (
        <Fragment>
            {Boolean(currentLecture) && (
                <EditButton
                    content_id={currentLecture.id}
                    content="Upravit lekci"
                    onClick={() => setShouldModalOpen(true)}
                    data-qa="button_edit_lecture"
                />
            )}
            {!currentLecture && (
                <AddButton
                    content="Přidat lekci"
                    onClick={() => setShouldModalOpen(true)}
                    data-qa="button_add_lecture"
                />
            )}
            <ModalLecturesCore
                currentLecture={currentLecture}
                refresh={refresh}
                object={object}
                IS_CLIENT={IS_CLIENT}
                defaultValuesForLecture={defaultValuesForLecture}
                shouldModalOpen={shouldModalOpen}
                funcCloseCallback={() => setShouldModalOpen(false)}
            />
        </Fragment>
    )
}

export default ModalLectures
