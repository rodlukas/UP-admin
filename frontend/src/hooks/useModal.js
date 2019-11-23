import { useEffect, useState } from "react"

const useModal = () => {
    const [isModal, setModal] = useState(false)
    const [isFormDirty, setFormDirty] = useState(false)

    const toggleModal = () => {
        if (
            !isFormDirty ||
            (isFormDirty && window.confirm("Opravdu chcete zavřít formulář bez uložení změn?"))
        ) {
            toggleModalForce()
            return true
        }
        return false
    }

    const toggleModalForce = () => {
        // pokud se zavira, zresetuj dirty indikator
        isModal && setFormDirty(false)
        setModal(prevIsModal => !prevIsModal)
    }

    // beforeunload listener, upozorni na neulozene zmeny pri opousteni stranky
    useEffect(() => {
        const beforeUnload = e => {
            if (isFormDirty) {
                e.preventDefault()
                e.returnValue = ""
            }
        }
        isFormDirty && window.addEventListener("beforeunload", beforeUnload)
        return () => window.removeEventListener("beforeunload", beforeUnload)
    }, [isFormDirty])

    return [isModal, toggleModal, toggleModalForce, setFormDirty, setModal]
}

export default useModal
