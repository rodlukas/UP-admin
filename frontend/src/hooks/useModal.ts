import * as React from "react"
import { noop } from "../global/utils"
import { ModalTempData } from "../types/components"
import { fEmptyVoid } from "../types/types"

const DIRTY_INDICATORS = {
    CLEAN: 1,
    DIRTY: 2,
    SUBMITTED_DIRTY: 3,
}

type UseModal = readonly [
    boolean,
    () => boolean,
    (modalSubmitted?: boolean, dataToStore?: ModalTempData | null) => boolean,
    fEmptyVoid,
    (value: ((prevState: boolean) => boolean) | boolean) => void,
    (callback?: () => void) => void,
    ModalTempData | null
]

/** Hook pro jednoduchou práci s modálním oknem. */
const useModal = (): UseModal => {
    const [isModal, setModal] = React.useState(false)
    const [formState, setFormState] = React.useState(DIRTY_INDICATORS.CLEAN)
    const [tempData, setTempData] = React.useState<ModalTempData | null>(null)

    const toggleModalForce = (
        modalSubmitted = true,
        dataToStore: ModalTempData | null = null
    ): boolean => {
        // pokud se zavira a probehl submit formulare/smazani, zapamatuj si to
        // POZOR: na zaver je stejne potreba zresetovat stav na clean, toto ma na starost
        // funkce processOnModalClose, kterou musi komponenta zavolat
        isModal && modalSubmitted && setFormState(DIRTY_INDICATORS.SUBMITTED_DIRTY)
        // uloz docasna data potrebna pro dalsi praci v aplikaci
        dataToStore && setTempData(dataToStore)

        setModal((prevIsModal) => !prevIsModal)
        // zavira se - vrat true pro rodicovske komponenty
        return true
    }

    const toggleModal = (): boolean => {
        // pokud neni formular upraveny NEBO je, ale uzivatel potvrdil, ze ho to nezajima, zavirame ho
        // je potreba korektne vracet navratove hodnoty, zda byl formular zavren nebo nikoliv kvuli
        //  kvuli chovani rodicovskych komponent
        if (
            formState === DIRTY_INDICATORS.CLEAN ||
            window.confirm("Opravdu chcete zavřít formulář bez uložení změn?")
        ) {
            return toggleModalForce(false)
        }
        return false
    }

    const setFormDirty = (): void => setFormState(DIRTY_INDICATORS.DIRTY)

    const processOnModalClose = (callback = noop): void => {
        // funkce, kterou musi zavolat komponenta pouzivajici hook pri zavirani modalu,
        // provede pripadny zaslany callback pokud byl formular submitnuty/probehlo smazani
        if (formState === DIRTY_INDICATORS.SUBMITTED_DIRTY) {
            callback()
        }
        // zresetuj dirty indikator
        setFormState(DIRTY_INDICATORS.CLEAN)
    }

    // beforeunload listener, upozorni na neulozene zmeny pri opousteni stranky
    React.useEffect(() => {
        const beforeUnload = (e: BeforeUnloadEvent): void => {
            if (formState === DIRTY_INDICATORS.DIRTY) {
                e.preventDefault()
                e.returnValue = ""
            }
        }
        formState === DIRTY_INDICATORS.DIRTY &&
            window.addEventListener("beforeunload", beforeUnload)
        return (): void => window.removeEventListener("beforeunload", beforeUnload)
    }, [formState])

    return [
        isModal,
        toggleModal,
        toggleModalForce,
        setFormDirty,
        setModal,
        processOnModalClose,
        tempData,
    ] as const
}

export default useModal
