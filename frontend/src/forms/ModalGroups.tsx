import * as React from "react"
import { Modal } from "reactstrap"
import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import { GroupsActiveContext } from "../contexts/GroupsActiveContext"
import useModal from "../hooks/useModal"
import { ModalGroupsData } from "../types/components"
import { GroupType } from "../types/models"
import FormGroups from "./FormGroups"
import { DummyGroup } from "./helpers/dummies"

type Props = {
    currentGroup?: GroupType
    inSentence?: boolean
    processAdditionOfGroup?: (newGroup: GroupType) => void
    refresh: (data: ModalGroupsData) => void
}

/** Modální okno s formulářem pro skupiny. Včetně tlačítek pro vyvolání přidání/úpravy. */
const ModalGroups: React.FunctionComponent<Props> = ({
    currentGroup,
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

    const groupsActiveContext = React.useContext(GroupsActiveContext)

    function onModalClose(): void {
        processOnModalClose(() => {
            refresh(tempData)
            // projeveni zmen do aktivnich skupin
            groupsActiveContext.funcHardRefresh()
        })
    }

    return (
        <>
            {currentGroup ? (
                <EditButton
                    contentId={currentGroup.id}
                    content="Upravit skupinu"
                    onClick={toggleModal}
                    data-qa="button_edit_group"
                />
            ) : (
                <AddButton
                    content={`${inSentence ? "přidejte novou" : "Přidat"} skupinu`}
                    small={inSentence}
                    onClick={toggleModal}
                    data-qa="button_add_group"
                />
            )}
            <Modal isOpen={isModal} toggle={toggleModal} autoFocus={false} onClosed={onModalClose}>
                <FormGroups
                    group={currentGroup ? currentGroup : DummyGroup}
                    funcClose={toggleModal}
                    funcForceClose={toggleModalForce}
                    setFormDirty={setFormDirty}
                    funcProcessAdditionOfGroup={processAdditionOfGroup}
                />
            </Modal>
        </>
    )
}

export default ModalGroups
