import { useState } from "react"

const useModal = () => {
    const [isModal, setModal] = useState(false)

    const toggleModal = () => {
        setModal(prevIsModal => !prevIsModal)
    }

    return [isModal, toggleModal]
}

export default useModal
