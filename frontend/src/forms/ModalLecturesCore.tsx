import * as React from "react"
import { Modal } from "reactstrap"

import { DefaultValuesForLecture } from "../global/utils"
import useModal from "../hooks/useModal"
import { ClientType, GroupType, LectureType } from "../types/models"
import { fEmptyVoid } from "../types/types"

import FormLectures from "./FormLectures"
import { DummyLecture } from "./helpers/dummies"
import * as styles from "./ModalLecturesCore.css"

type Props = {
    /** Lekce. */
    currentLecture?: LectureType
    /** Výchozí hodnoty pro lekci. */
    defaultValuesForLecture?: DefaultValuesForLecture
    /** Objekt, který má přiřazenu danou lekci (klient/skupina). */
    object?: ClientType | GroupType | null
    /** Funkce, která se zavolá při jakémkoliv zavírání modálního okna. */
    funcCloseCallback: fEmptyVoid
    /** Modální okno s formulářem se má otevřít (true). */
    shouldModalOpen?: boolean
    /** Datum lekce. */
    date?: string
    /** Identifikace místa, odkud bylo modální okno otevřeno (pro analytiku). */
    source: string
}

/**
 * Jádro modálního okna s formulářem pro lekce.
 * Má na starosti samotnou práci s modálním oknem a je přepoužíváno v různých kontextech.
 */
const ModalLecturesCore: React.FC<Props> = ({
    currentLecture,
    object,
    defaultValuesForLecture,
    funcCloseCallback,
    shouldModalOpen = false,
    date = "",
    source,
}) => {
    const [isModal, toggleModal, toggleModalForce, setFormDirty, setModal, processOnModalClose] =
        useModal()
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
            className={styles.modalFormLecture}
            onClosed={processOnModalClose}>
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
                    source={source}
                />
            )}
        </Modal>
    )
}

export default ModalLecturesCore
