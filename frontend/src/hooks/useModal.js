import {useState} from "react"

const useModal = () => {
    const [isModal, setModal] = useState(false)

    const toggleModal = () => {
        setModal(!isModal)
    }

    return [
        isModal,
        toggleModal
    ]
}

export default useModal
