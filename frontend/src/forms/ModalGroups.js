import React, { Fragment, useContext } from "react"
import { Modal } from "reactstrap"
import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import { GroupsActiveContext } from "../contexts/GroupsActiveContext"
import useModal from "../hooks/useModal"
import FormGroups from "./FormGroups"

/** Modální okno s formulářem pro skupiny. Včetně tlačítek pro vyvolání přidání/úpravy. */
const ModalGroups = ({
    currentGroup = null,
    sendResult = false,
    inSentence = false,
    refresh,
    processAdditionOfGroup
}) => {
    const [
        isModal,
        toggleModal,
        toggleModalForce,
        setFormDirty,
        ,
        processOnModalClose,
        tempData
    ] = useModal()

    const groupsActiveContext = useContext(GroupsActiveContext)

    function onModalClose() {
        processOnModalClose(() => {
            refresh(tempData)
            // projeveni zmen do aktivnich skupin
            groupsActiveContext.funcHardRefresh()
        })
    }

    return (
        <Fragment>
            {Boolean(currentGroup) && (
                <EditButton
                    content_id={currentGroup.id}
                    content="Upravit skupinu"
                    onClick={toggleModal}
                    data-qa="button_edit_group"
                />
            )}
            {!currentGroup && (
                <AddButton
                    content={`${inSentence ? "přidejte novou" : "Přidat"} skupinu`}
                    small={inSentence}
                    onClick={toggleModal}
                    data-qa="button_add_group"
                />
            )}
            <Modal isOpen={isModal} toggle={toggleModal} autoFocus={false} onClosed={onModalClose}>
                <FormGroups
                    group={currentGroup ? currentGroup : {}}
                    funcClose={toggleModal}
                    funcForceClose={toggleModalForce}
                    setFormDirty={setFormDirty}
                    funcProcessAdditionOfGroup={processAdditionOfGroup}
                    sendResult={sendResult}
                />
            </Modal>
        </Fragment>
    )
}

export default ModalGroups
