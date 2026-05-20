import { Group, Select } from "@mantine/core"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import * as React from "react"

import { CourseType } from "../../types/models"

import * as styles from "./SelectCourse.css"

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
}

/** Pomocná komponenta – barevné kolečko kurzu v option. */
const CourseDot: React.FC<{ color: string }> = ({ color }) => (
    <div
        className={styles.courseDot}
        style={assignInlineVars({ [styles.courseDotColor]: color })}
    />
)

/** Komponenta s Mantine Select pro výběr kurzu (zobrazuje barevné kolečko u každé položky). */
const SelectCourse: React.FC<SelectCourseProps> = ({
    value,
    onChangeCallback,
    options = [],
    isDisabled = false,
    required = false,
    label,
}) => {
    const data = options.map((c) => ({ value: c.id.toString(), label: c.name }))

    return (
        <Select
            id="course"
            data={data}
            value={value?.id.toString() ?? null}
            onChange={(val) => {
                const found = options.find((c) => c.id.toString() === val) ?? null
                onChangeCallback("course", found)
            }}
            label={label}
            placeholder="Vyberte kurz..."
            searchable
            clearable={!required}
            withAsterisk={required}
            required={required}
            disabled={isDisabled}
            comboboxProps={{ withinPortal: true }}
            renderOption={({ option }) => {
                const course = options.find((c) => c.id.toString() === option.value)
                return (
                    <Group gap="xs" wrap="nowrap">
                        {course && <CourseDot color={course.color} />}
                        <span data-gdpr>{option.label}</span>
                    </Group>
                )
            }}
            leftSection={value && <CourseDot color={value.color} />}
        />
    )
}

export default SelectCourse
