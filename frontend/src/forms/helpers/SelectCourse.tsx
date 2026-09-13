import { Group, Select } from "@mantine/core"
import * as React from "react"

import CourseCircle from "../../components/CourseCircle"
import { TEXTS } from "../../global/constants"
import { withSelectedOptions } from "../../global/utils"
import { type CourseType } from "../../types/models"

/** Velikost tečky u kurzu v options – stejný recept na barvu jako všude jinde (`CourseCircle`). */
const COURSE_DOT_SIZE = 0.875

type SelectCourseProps = {
    /** Vybraný kurz. */
    value?: CourseType | null
    /** Seznam kurzů. */
    options?: readonly CourseType[]
    /** Funkce volaná při výběru kurzu. */
    onChangeCallback: (name: "course", newValue?: CourseType | null) => void
    /** Disabled stav selectu. */
    isDisabled?: boolean
    /** Povinné pole (vizuální, validace probíhá v nadřazeném formuláři). */
    required?: boolean
    /** Popisek pole (předán Mantine Select jako label). */
    label?: string
    /** Chybová zpráva pod polem (validaci povinného pole řídí nadřazený formulář). */
    error?: React.ReactNode
    /**
     * DOM id selectu — výchozí hodnotu "course" hledají E2E testy (`By.ID "course"`),
     * vlastní id zasílej jen pokud by mohly být současně namountované dvě instance.
     */
    id?: string
}

/** Komponenta s Mantine Select pro výběr kurzu (zobrazuje barevné kolečko u každé položky). */
const SelectCourse: React.FC<SelectCourseProps> = ({
    value,
    onChangeCallback,
    options = [],
    isDisabled = false,
    required = false,
    label,
    error,
    id = "course",
}) => {
    // Formuláře posílají jen viditelné kurzy — vybraný, ale mezitím skrytý kurz
    // (visible=false u editované skupiny/lekce/zájemce) by v options chyběl a Select by
    // zobrazil prázdno; povinný input by pak nativní validací blokoval celé uložení.
    // Stejný vzor jako v SelectClient.
    const data = React.useMemo(
        () =>
            withSelectedOptions(options, value ? [value] : []).map((c) => ({
                value: c.id.toString(),
                label: c.name,
            })),
        [options, value],
    )

    return (
        <Select
            id={id}
            data={data}
            value={value?.id.toString() ?? null}
            onChange={(val) => {
                // i skrytý kurz musí jít znovu vybrat (stejná logika jako u SelectClient)
                const found =
                    value?.id.toString() === val
                        ? value
                        : (options.find((c) => c.id.toString() === val) ?? null)
                onChangeCallback("course", found)
            }}
            label={label}
            // aria-label jen když chybí viditelný label (viz SelectClient) — souběh obou
            // by byl matoucí, kdyby se od sebe časem obsahově rozešly
            aria-label={label ? undefined : "Kurz"}
            placeholder="Vyberte kurz…"
            searchable
            nothingFoundMessage={TEXTS.NO_RESULTS}
            clearable={!required}
            // allowDeselect: stejný důvod jako u SelectClient
            allowDeselect={!required}
            withAsterisk={required}
            required={required}
            error={error}
            disabled={isDisabled}
            renderOption={({ option }) => {
                const course =
                    options.find((c) => c.id.toString() === option.value) ??
                    (value?.id.toString() === option.value ? value : undefined)
                return (
                    <Group gap="xs" wrap="nowrap">
                        {course && <CourseCircle color={course.color} size={COURSE_DOT_SIZE} />}
                        {/* název kurzu není osobní údaj — bez data-gdpr (GDPR režim by
                            volby začernil a kurz by nešlo vybrat) */}
                        <span>{option.label}</span>
                    </Group>
                )
            }}
            leftSection={value && <CourseCircle color={value.color} size={COURSE_DOT_SIZE} />}
        />
    )
}

export default SelectCourse
