import * as React from "react"
import { Modal } from "reactstrap"

import { DefaultValuesForLecture } from "../global/utils"
import useModal from "../hooks/useModal"
import { ClientType, GroupType, LectureType } from "../types/models"
import { fEmptyVoid } from "../types/types"

import FormLectures from "./FormLectures"
import { DummyLecture } from "./helpers/dummies"

type Props = {
    /** Lekce. */
    currentLecture?: LectureType
    /** Výchozí hodnoty pro lekci. */
    defaultValuesForLecture?: DefaultValuesForLecture
    /** Funkce, která se zavolá po zavření modálního okna - obnoví data v rodiči. */
    refresh?: fEmptyVoid
    /** Objekt, který má přiřazenu danou lekci (klient/skupina). */
    object?: ClientType | GroupType | null
    /** Funkce, která se zavolá při jakémkoliv zavírání modálního okna. */
    funcCloseCallback: fEmptyVoid
    /** Modální okno s formulářem se má otevřít (true). */
    shouldModalOpen?: boolean
    /** Datum lekce. */
    date?: string
}

/**
 * Jádro modálního okna s formulářem pro lekce.
 * Má na starosti samotnou práci s modálním oknem a je přepoužíváno v různých kontextech.
 */
const ModalLecturesCore: React.FC<Props> = ({
    currentLecture,
    refresh,
    object,
    defaultValuesForLecture,
    funcCloseCallback,
    shouldModalOpen = false,
    date = "",
}) => {
    const [isModal, toggleModal, toggleModalForce, setFormDirty, setModal, processOnModalClose] =
        useModal()

    function onModalClose(): void {
        processOnModalClose(refresh)
    }

    function funcWrapper(func: () => boolean): void {
        if (func()) {
            funcCloseCallback()
        }
    }

    React.useEffect(() => {
        setModal(shouldModalOpen)
    }, [shouldModalOpen, setModal])

    // komponente muze prijit object=null (pri zavirani v ModalLecturesWizard), proto osetreni "object &&"
    return (
        <Modal
            isOpen={isModal}
            toggle={(): void => funcWrapper(toggleModal)}
            size="lg"
            className="ModalFormLecture"
            onClosed={onModalClose}>
            {object && (
                <FormLectures
                    lecture={currentLecture ?? DummyLecture}
                    object={object}
                    date={date}
                    defaultValuesForLecture={defaultValuesForLecture}
                    funcClose={(): void => {
                        funcWrapper(toggleModal)
                    }}
                    funcForceClose={(): void => {
                        funcWrapper(toggleModalForce)
                    }}
                    setFormDirty={setFormDirty}
                />
            )}
        </Modal>
    )
}

export default ModalLecturesCore
