import * as React from "react"
import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import { DefaultValuesForLecture } from "../global/utils"
import { ClientType, GroupType, LectureType } from "../types/models"
import { fEmptyVoid } from "../types/types"
import ModalLecturesCore from "./ModalLecturesCore"

type Props = {
    /** Lekce. */
    currentLecture?: LectureType
    /** Výchozí hodnoty pro lekci. */
    defaultValuesForLecture?: DefaultValuesForLecture
    /** Funkce, která se zavolá po zavření modálního okna - obnoví data v rodiči. */
    refresh?: fEmptyVoid
    /** Objekt, který má přiřazenu danou lekci (klient/skupina). */
    object?: ClientType | GroupType | null
}

/**
 * Kostra modálního okna s formulářem pro lekce. Včetně tlačítek pro vyvolání přidání/úpravy.
 * Práci s modálním oknem má na starosti potomek ModalLecturesCore.
 */
const ModalLectures: React.FC<Props> = ({
    currentLecture,
    refresh,
    object,
    defaultValuesForLecture,
}) => {
    const [shouldModalOpen, setShouldModalOpen] = React.useState(false)
    return (
        <>
            {currentLecture ? (
                <EditButton
                    contentId={currentLecture.id}
                    content="Upravit lekci"
                    onClick={(): void => setShouldModalOpen(true)}
                    data-qa="button_edit_lecture"
                />
            ) : (
                <AddButton
                    content="Přidat lekci"
                    onClick={(): void => setShouldModalOpen(true)}
                    data-qa="button_add_lecture"
                />
            )}
            <ModalLecturesCore
                currentLecture={currentLecture}
                refresh={refresh}
                object={object}
                defaultValuesForLecture={defaultValuesForLecture}
                shouldModalOpen={shouldModalOpen}
                funcCloseCallback={(): void => setShouldModalOpen(false)}
            />
        </>
    )
}

export default ModalLectures
