import { Alert, ColorInput } from "@mantine/core"
import chroma from "chroma-js"
import * as React from "react"

import * as styles from "./ColorPicker.css"

const COLOR_SWATCHES = [
    "#868e96",
    "#fa5252",
    "#e64980",
    "#be4bdb",
    "#7950f2",
    "#4c6ef5",
    "#228be6",
    "#15aabf",
    "#12b886",
    "#40c057",
    "#82c91e",
    "#fab005",
]

type Props = {
    /** Aktuální barva kurzu jako hex řetězec. */
    value: string
    /** Funkce, která se zavolá při změně barvy kurzu. */
    onChange: (hex: string) => void
}

const hasLowContrast = (hex: string): boolean => {
    try {
        return chroma.contrast(chroma(hex), "white") < 2
    } catch {
        return false
    }
}

/** Komponenta pro pole s výběrem barvy kurzu. */
const ColorPicker: React.FC<Props> = ({ value, onChange }) => {
    const [showContrastWarning, setShowContrastWarning] = React.useState(() =>
        hasLowContrast(value),
    )

    React.useEffect(() => {
        setShowContrastWarning(hasLowContrast(value))
    }, [value])

    const handleChange = React.useCallback(
        (newHex: string): void => {
            onChange(newHex.toUpperCase())
        },
        [onChange],
    )

    return (
        <div className={styles.colorInputWrapper}>
            <ColorInput
                id="color"
                label="Barva"
                labelProps={{ "data-qa": "settings_label_color" }}
                withAsterisk
                format="hex"
                value={value}
                onChange={handleChange}
                swatches={COLOR_SWATCHES}
                data-qa="settings_color_picker"
            />
            {showContrastWarning && (
                <Alert color="yellow" mt="xs">
                    Zvolená barva je málo kontrastní k&nbsp;bílé a&nbsp;byla by špatně vidět,
                    zvolte více kontrastnější.
                </Alert>
            )}
        </div>
    )
}

export default ColorPicker
