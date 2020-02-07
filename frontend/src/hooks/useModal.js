import { useEffect, useState } from "react"

const DIRTY_INDICATORS = {
    CLEAN: 1,
    DIRTY: 2,
    SUBMITTED_DIRTY: 3
}

const useModal = () => {
    const [isModal, setModal] = useState(false)
    const [formState, setFormState] = useState(DIRTY_INDICATORS.CLEAN)
    const [tempData, setTempData] = useState(null)

    const toggleModal = () => {
        // pokud neni formular upraveny NEBO je, ale uzivatel potvrdil, ze ho to nezajima, zavirame ho
        // je potreba korektne vracet navratove hodnoty, zda byl formular zavren nebo nikoliv kvuli
        //  kvuli chovani rodicovskych komponent
        if (
            formState === DIRTY_INDICATORS.CLEAN ||
            window.confirm("Opravdu chcete zavřít formulář bez uložení změn?")
        )
            return toggleModalForce(false)
        return false
    }

    const setFormDirty = () => setFormState(DIRTY_INDICATORS.DIRTY)

    const processOnModalClose = (callback = () => {}) => {
        // funkce, kterou musi zavolat komponenta pouzivajici hook pri zavirani modalu,
        // provede pripadny zaslany callback pokud byl formular submitnuty/probehlo smazani
        if (formState === DIRTY_INDICATORS.SUBMITTED_DIRTY) callback()
        // zresetuj dirty indikator
        setFormState(DIRTY_INDICATORS.CLEAN)
    }

    const toggleModalForce = (modalSubmitted = true, dataToStore = null) => {
        // pokud se zavira a probehl submit formulare/smazani, zapamatuj si to
        // POZOR: na zaver je stejne potreba zresetovat stav na clean, toto ma na starost
        // funkce processOnModalClose, kterou musi komponenta zavolat
        isModal && modalSubmitted && setFormState(DIRTY_INDICATORS.SUBMITTED_DIRTY)
        // uloz docasna data potrebna pro dalsi praci v aplikaci
        dataToStore && setTempData(dataToStore)

        setModal(prevIsModal => !prevIsModal)
        // zavira se - vrat true pro rodicovske komponenty
        return true
    }

    // beforeunload listener, upozorni na neulozene zmeny pri opousteni stranky
    useEffect(() => {
        const beforeUnload = e => {
            if (formState === DIRTY_INDICATORS.DIRTY) {
                e.preventDefault()
                e.returnValue = ""
            }
        }
        formState === DIRTY_INDICATORS.DIRTY &&
            window.addEventListener("beforeunload", beforeUnload)
        return () => window.removeEventListener("beforeunload", beforeUnload)
    }, [formState])

    return [
        isModal,
        toggleModal,
        toggleModalForce,
        setFormDirty,
        setModal,
        processOnModalClose,
        tempData
    ]
}

export default useModal
