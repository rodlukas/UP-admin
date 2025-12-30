import * as React from "react"
import { ColorPicker as ReactColorPicker } from "react-color-palette"
import "react-color-palette/css"
import { Col, FormGroup, Label } from "reactstrap"

import * as styles from "./ColorPicker.css"

type Props = {
    /** Barva kurzu. */
    color: (typeof ReactColorPicker)["color"]
    /** Funkce, která se zavolá při změně barvy kurzu. */
    onChange: (typeof ReactColorPicker)["onChange"]
}

/** Komponenta pro pole s výběrem barvy kurzu. */
const ColorPicker: React.FC<Props> = (props) => {
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
                        onChange={props.onChange}
                    />
                </div>
            </Col>
        </FormGroup>
    )
}

export default ColorPicker
