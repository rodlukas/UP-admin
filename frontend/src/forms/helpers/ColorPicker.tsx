import { Grid } from "@mantine/core"
import chroma from "chroma-js"
import * as React from "react"
import { ColorPicker as ReactColorPicker, type IColor } from "react-color-palette"
import "react-color-palette/css"
import { toast } from "react-toastify"

import Notification from "../../components/Notification"

import * as styles from "./ColorPicker.css"

export const COLOR_PICKER_VALIDATION_TOAST_ID = "ColorPickerValidation"

type Props = {
    /** Barva kurzu. */
    color: IColor
    /** Funkce, která se zavolá při změně barvy kurzu. */
    onChange: (color: IColor) => void
}

/** Komponenta pro pole s výběrem barvy kurzu. */
const ColorPicker: React.FC<Props> = (props) => {
    const validateColor = React.useCallback((color: string): void => {
        if (chroma.contrast(chroma(color), "white") < 2) {
            toast.warning(
                <Notification text="Zvolená barva je málo kontrastní k&nbsp;bílé a&nbsp;byla by špatně vidět, zvolte více kontrastnější." />,
                {
                    toastId: COLOR_PICKER_VALIDATION_TOAST_ID,
                    autoClose: false,
                },
            )
        } else {
            toast.dismiss(COLOR_PICKER_VALIDATION_TOAST_ID)
        }
    }, [])

    const handleChange = React.useCallback(
        (newColor: IColor): void => {
            validateColor(newColor.hex)
            props.onChange({
                ...newColor,
                hex: newColor.hex.toUpperCase(),
            })
        },
        [props, validateColor],
    )

    return (
        <Grid align="flex-start" mb="sm">
            <Grid.Col span={{ base: 12, sm: 3 }}>
                <label htmlFor="hex" data-qa="settings_label_color">
                    Barva{" "}
                    <span aria-hidden className={styles.requiredMark}>
                        *
                    </span>
                </label>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 9 }}>
                <div className={styles.colorPickerContainer} data-qa="settings_color_picker">
                    <ReactColorPicker
                        height={130}
                        hideAlpha
                        hideInput={["rgb", "hsv"]}
                        color={props.color}
                        onChange={handleChange}
                    />
                </div>
            </Grid.Col>
        </Grid>
    )
}

export default ColorPicker
