import * as React from "react"
import { Modal } from "reactstrap"

import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import { useGroupsActiveContext } from "../contexts/GroupsActiveContext"
import useModal from "../hooks/useModal"
import { ModalGroupsData } from "../types/components"
import { GroupType } from "../types/models"

import FormGroups from "./FormGroups"
import { DummyGroup } from "./helpers/dummies"

type Props = {
    /** Skupina. */
    currentGroup?: GroupType
    /** Tlačítka pro otevření modálního okna jsou součástí vět (pro použití s komponentou Or). */
    withOr?: boolean
    /** Funkce, která se zavolá po úspěšném přidání skupiny (spolu s daty o skupině). */
    processAdditionOfGroup?: (newGroup: GroupType) => void
    /** Funkce, která se zavolá po zavření modálního okna - obnoví data v rodiči. */
    refresh: (data: ModalGroupsData) => void
}

/** Modální okno s formulářem pro skupiny. Včetně tlačítek pro vyvolání přidání/úpravy. */
const ModalGroups: React.FC<Props> = ({
    currentGroup,
    withOr = false,
    refresh,
    processAdditionOfGroup,
}) => {
    const [isModal, toggleModal, toggleModalForce, setFormDirty, , processOnModalClose, tempData] =
        useModal()

    const groupsActiveContext = useGroupsActiveContext()

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
                    content={`${withOr ? "přidejte novou" : "Přidat"} skupinu`}
                    small={withOr}
                    onClick={toggleModal}
                    data-qa="button_add_group"
                />
            )}
            <Modal isOpen={isModal} toggle={toggleModal} autoFocus={false} onClosed={onModalClose}>
                <FormGroups
                    group={currentGroup ?? DummyGroup}
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
