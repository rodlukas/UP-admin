import {faPalette} from "@fortawesome/pro-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import React, {Fragment, useState} from "react"
import {ChromePicker} from "react-color"
import {Col, InputGroup, InputGroupAddon, Label} from "reactstrap"
import "./ColorPicker.css"

const ColorPicker = props => {
    const [isPickerVisible, setIsPickerVisible] = useState(false)

    function togglePicker() {
        setIsPickerVisible(prevIsPickerVisible => !prevIsPickerVisible)
    }

    function closePicker() {
        setIsPickerVisible(false)
    }

    return (
        <Fragment>
            <Label for="color" sm={3} className="py-0" onClick={togglePicker}>
                Barva
            </Label>
            <Col sm={9}>
                <InputGroup title="Barva">
                    <InputGroupAddon addonType="prepend">
                        <Label className="input-group-text" for="color" onClick={togglePicker}>
                            <FontAwesomeIcon icon={faPalette} fixedWidth/>
                        </Label>
                    </InputGroupAddon>
                    <div id="color" data-qa="settings_field_color" tabIndex="0" onFocus={togglePicker}
                         className="ColorPickerInput" onClick={togglePicker} title="Změnit barvu">
                        <div style={{background: props.color}}/>
                    </div>
                    {isPickerVisible ?
                        <div className="ColorPickerWindow" onMouseLeave={closePicker}
                             onBlur={closePicker}>
                            <ChromePicker
                                disableAlpha
                                color={props.color}
                                onChange={newColor => props.onChange(newColor.hex)}/>
                        </div>
                        : null}
                </InputGroup>
            </Col>
        </Fragment>
    )
}

export default ColorPicker
