import { Group, Select } from "@mantine/core"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import * as React from "react"

import { TEXTS } from "../../global/constants"
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
    /** Chybová zpráva pod polem (validaci povinného pole řídí nadřazený formulář). */
    error?: React.ReactNode
    /**
     * DOM id selectu — výchozí hodnotu "course" hledají E2E testy (`By.ID "course"`),
     * vlastní id zasílej jen pokud by mohly být současně namountované dvě instance.
     */
    id?: string
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
    error,
    id = "course",
}) => {
    // Formuláře posílají jen viditelné kurzy — vybraný, ale mezitím skrytý kurz
    // (visible=false u editované skupiny/lekce/zájemce) by v options chyběl a Select by
    // zobrazil prázdno; povinný input by pak nativní validací blokoval celé uložení.
    // Stejný vzor jako v SelectClient.
    const data = React.useMemo(() => {
        const items = options.map((c) => ({ value: c.id.toString(), label: c.name }))
        if (value && !options.some((c) => c.id === value.id)) {
            items.push({ value: value.id.toString(), label: value.name })
        }
        return items
    }, [options, value])

    return (
        <Select
            id={id}
            data={data}
            value={value?.id.toString() ?? null}
            onChange={(val) => {
                // i skrytý kurz (mimo `options`, viz `data` memo) musí jít znovu vybrat –
                // když `val` odpovídá aktuální hodnotě, vrať ji přímo
                const found =
                    value?.id.toString() === val
                        ? value
                        : (options.find((c) => c.id.toString() === val) ?? null)
                onChangeCallback("course", found)
            }}
            label={label}
            // `aria-label` má v accessible name computation přednost před přiřazeným
            // <label> — nastav ho proto jen když viditelný label chybí (jinak zbytečně
            // duplicitní, ale hlavně matoucí, kdyby se od sebe časem obsahově rozešly)
            aria-label={label ? undefined : "Kurz"}
            placeholder="Vyberte kurz…"
            searchable
            nothingFoundMessage={TEXTS.NO_RESULTS}
            clearable={!required}
            // bez tohohle jde povinnou hodnotu vynulovat i překliknutím už vybrané položky
            // v otevřeném dropdownu (Mantine `allowDeselect` je jinak defaultně `true`)
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
                        {course && <CourseDot color={course.color} />}
                        {/* název kurzu není osobní údaj — bez data-gdpr (GDPR režim by
                            volby začernil a kurz by nešlo vybrat) */}
                        <span>{option.label}</span>
                    </Group>
                )
            }}
            leftSection={value && <CourseDot color={value.color} />}
        />
    )
}

export default SelectCourse
