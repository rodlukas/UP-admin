import React, {Fragment} from "react"
import {Modal} from "reactstrap"
import EditButton from "../components/buttons/EditButton"
import AddButton from "../components/buttons/AddButton"
import useModal from "../hooks/useModal"
import FormGroups from "./FormGroups"

const ModalGroups = ({currentGroup = null, refresh}) => {
    const [isModal, toggleModal] = useModal()

    return (
        <Fragment>
            {Boolean(currentGroup) &&
            <EditButton content="Upravit skupinu" onClick={toggleModal} data-qa="button_edit_group"/>}
            {!Boolean(currentGroup) && <AddButton content="Přidat skupinu" onClick={toggleModal}
                                                  data-qa="button_add_group"/>}
            <Modal isOpen={isModal} toggle={toggleModal} autoFocus={false}>
                <FormGroups group={Boolean(currentGroup) ? currentGroup : {}}
                            funcClose={toggleModal}
                            funcRefresh={refresh}/>
            </Modal>
        </Fragment>
    )
}

export default ModalGroups
