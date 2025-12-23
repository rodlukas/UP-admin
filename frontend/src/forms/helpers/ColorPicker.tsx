import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPalette } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import chroma from "chroma-js"
import * as React from "react"
import { ChromePicker } from "react-color"
import { toast } from "react-toastify"
import { Col, InputGroup, InputGroupAddon, Label } from "reactstrap"

import Notification from "../../components/Notification"
import UncontrolledTooltipWrapper from "../../components/UncontrolledTooltipWrapper"

import styles from "./ColorPicker.module.css"

type Props = {
    /** Barva kurzu. */
    color: string
    /** Funkce, která se zavolá při změně barvy kurzu. */
    onChange: (newColor: string) => void
}

const customToastId = "ColorPicker"

/** Komponenta pro pole s výběrem barvy kurzu. */
const ColorPicker: React.FC<Props> = (props) => {
    const [isPickerVisible, setIsPickerVisible] = React.useState(false)

    const validateColor = React.useCallback((color: string): void => {
        // pokud barvy nejsou dostatecne kontrastni a jeste neni zobrazene upozorneni, zobraz ho
        if (chroma.contrast(chroma(color), "white") < 2) {
            toast(
                <Notification
                    type={toast.TYPE.WARNING}
                    text="Zvolená barva je málo kontrastní k bílé a byla by špatně vidět, zvolte více kontrastnější."
                />,
                {
                    toastId: customToastId,
                    autoClose: false,
                    type: toast.TYPE.WARNING,
                },
            )
        } else {
            toast.dismiss(customToastId)
        }
    }, [])

    const togglePicker = React.useCallback((): void => {
        if (!isPickerVisible) {
            validateColor(props.color)
        }
        setIsPickerVisible((prev) => !prev)
    }, [isPickerVisible, props.color, validateColor])

    const closePicker = React.useCallback((): void => {
        setIsPickerVisible(false)
        toast.dismiss(customToastId)
    }, [])

    return (
        <>
            <Label for="color" sm={3} onClick={togglePicker}>
                Barva
            </Label>
            <Col sm={9}>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        <Label className="input-group-text" for="color" onClick={togglePicker}>
                            <FontAwesomeIcon icon={faPalette} fixedWidth />
                        </Label>
                    </InputGroupAddon>
                    <button
                        id="color"
                        type="button"
                        data-qa="course_button_color"
                        onFocus={togglePicker}
                        className={styles.colorPickerInput}
                        onClick={togglePicker}>
                        <div style={{ background: props.color }} />
                    </button>
                    <UncontrolledTooltipWrapper placement="right" target="color">
                        Změnit barvu
                    </UncontrolledTooltipWrapper>
                    {isPickerVisible ? (
                        <div
                            className={styles.colorPickerWindow}
                            data-qa="course_color_picker"
                            onMouseLeave={closePicker}
                            onBlur={closePicker}>
                            <ChromePicker
                                disableAlpha
                                color={props.color}
                                onChange={(newColor): void => {
                                    props.onChange(newColor.hex)
                                    validateColor(newColor.hex)
                                }}
                            />
                        </div>
                    ) : null}
                </InputGroup>
            </Col>
        </>
    )
}

export default ColorPicker
