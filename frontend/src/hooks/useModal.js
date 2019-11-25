import { useEffect, useState } from "react"

const useModal = () => {
    const [isModal, setModal] = useState(false)
    const [isFormDirty, setFormDirty] = useState(false)

    const toggleModal = () => {
        // pokud neni formular upraveny NEBO je, ale uzivatel potvrdil, ze ho to nezajima, zavirame ho
        // je potreba korektne vracet navratove hodnoty, zda byl formular zavren nebo nikoliv kvuli
        //  kvuli chovani rodicovskych komponent
        if (!isFormDirty || window.confirm("Opravdu chcete zavřít formulář bez uložení změn?"))
            return toggleModalForce()
        return false
    }

    const toggleModalForce = () => {
        // pokud se zavira, zresetuj dirty indikator
        isModal && setFormDirty(false)
        setModal(prevIsModal => !prevIsModal)
        // zavira se - vrat true pro rodicovske komponenty
        return true
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
