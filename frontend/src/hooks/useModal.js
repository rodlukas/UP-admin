import { useState } from "react"

const useModal = () => {
    const [isModal, setModal] = useState(false)
    const [isFormDirty, setFormDirty] = useState(false)

    const toggleModal = () => {
        if (!isFormDirty) {
            toggleModalForce()
            return true
        } else if (
            isFormDirty &&
            window.confirm("Opravdu chcete zavřít formulář bez uložení změn?")
        ) {
            setFormDirty(false)
            toggleModalForce()
            return true
        }
        return false
    }

    const toggleModalForce = () => setModal(prevIsModal => !prevIsModal)

    return [isModal, toggleModal, toggleModalForce, setFormDirty, setModal]
}

export default useModal
