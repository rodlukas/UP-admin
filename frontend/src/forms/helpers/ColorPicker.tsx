import * as React from "react"
import { ColorPicker as ReactColorPicker, type IColor } from "react-color-palette"
import "react-color-palette/css"
import { Col, FormGroup, Label } from "reactstrap"

import * as styles from "./ColorPicker.css"

type Props = {
    /** Barva kurzu. */
    color: IColor
    /** Funkce, která se zavolá při změně barvy kurzu. */
    onChange: (color: IColor) => void
}

/** Komponenta pro pole s výběrem barvy kurzu. */
const ColorPicker: React.FC<Props> = (props) => {
    const handleChange = React.useCallback(
        (newColor: IColor): void => {
            // Převedeme hex na uppercase, at jsme konzistentni se zbytkem UI
            props.onChange({
                ...newColor,
                hex: newColor.hex.toUpperCase(),
            })
        },
        [props],
    )

    return (
        <FormGroup row className="align-items-start form-group-required">
            <Label for="hex" sm={3}>
                Barva
            </Label>
            <Col sm={9}>
                <div className={styles.colorPickerContainer} data-qa="course_color_picker">
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
