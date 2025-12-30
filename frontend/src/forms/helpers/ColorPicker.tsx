import chroma from "chroma-js"
import * as React from "react"
import { ColorPicker as ReactColorPicker, type IColor } from "react-color-palette"
import "react-color-palette/css"
import { toast } from "react-toastify"
import { Col, FormGroup, Label } from "reactstrap"

import Notification from "../../components/Notification"

import * as styles from "./ColorPicker.css"

const customToastId = "ColorPicker"

type Props = {
    /** Barva kurzu. */
    color: IColor
    /** Funkce, která se zavolá při změně barvy kurzu. */
    onChange: (color: IColor) => void
}

/** Komponenta pro pole s výběrem barvy kurzu. */
const ColorPicker: React.FC<Props> = (props) => {
    const validateColor = React.useCallback((color: string): void => {
        // pokud barvy nejsou dostatecne kontrastni a jeste neni zobrazene upozorneni, zobraz ho
        if (chroma.contrast(chroma(color), "white") < 2) {
            toast.warning(
                <Notification text="Zvolená barva je málo kontrastní k&nbsp;bílé a&nbsp;byla by špatně vidět, zvolte více kontrastnější." />,
                {
                    toastId: customToastId,
                    autoClose: false,
                },
            )
        } else {
            toast.dismiss(customToastId)
        }
    }, [])

    const handleChange = React.useCallback(
        (newColor: IColor): void => {
            validateColor(newColor.hex)
            // prevedeme hex na uppercase, at jsme konzistentni se zbytkem UI
            props.onChange({
                ...newColor,
                hex: newColor.hex.toUpperCase(),
            })
        },
        [props, validateColor],
    )

    return (
        <FormGroup row className="align-items-start form-group-required">
            <Label for="hex" sm={3} data-qa="settings_label_color">
                Barva
            </Label>
            <Col sm={9}>
                <div className={styles.colorPickerContainer} data-qa="settings_color_picker">
                    <ReactColorPicker
                        height={130}
                        hideAlpha
                        hideInput={["rgb", "hsv"]}
                        color={props.color}
                        onChange={handleChange}
                    />
                </div>
            </Col>
        </FormGroup>
    )
}

export default ColorPicker
