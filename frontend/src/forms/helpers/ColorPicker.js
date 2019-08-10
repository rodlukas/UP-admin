import { faPalette } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import chroma from "chroma-js"
import React, { Fragment } from "react"
import { ChromePicker } from "react-color"
import { toast } from "react-toastify"
import { Col, InputGroup, InputGroupAddon, Label } from "reactstrap"
import Notification from "../../components/Notification"
import "./ColorPicker.css"

export default class ColorPicker extends React.Component {
    constructor(props) {
        super(props)
        this.customToastId = "ColorPicker"
        this.state = {
            isPickerVisible: false
        }
    }

    togglePicker = () => {
        if (!this.state.isPickerVisible) this.validateColor(this.props.color)
        this.setState(prevState => ({
            isPickerVisible: !prevState.isPickerVisible
        }))
    }

    closePicker = () => {
        this.setState({ isPickerVisible: false })
        toast.dismiss(this.customToastId)
    }

    validateColor = color => {
        // pokud barvy nejsou dostatecne kontrastni a jeste neni zobrazene upozorneni, zobraz ho
        if (chroma.contrast(chroma(color), "white") < 2) {
            toast(
                <Notification
                    type={toast.TYPE.WARNING}
                    text="Zvolená barva je málo kontrastní k bílé a byla by špatně vidět, zvolte více kontrastnější."
                />,
                {
                    toastId: this.customToastId,
                    autoClose: false,
                    type: toast.TYPE.WARNING
                }
            )
        } else toast.dismiss(this.customToastId)
    }

    render() {
        return (
            <Fragment>
                <Label for="color" sm={3} onClick={this.togglePicker}>
                    Barva
                </Label>
                <Col sm={9}>
                    <InputGroup>
                        <InputGroupAddon addonType="prepend" title="Barva">
                            <Label
                                className="input-group-text"
                                for="color"
                                onClick={this.togglePicker}>
                                <FontAwesomeIcon icon={faPalette} fixedWidth />
                            </Label>
                        </InputGroupAddon>
                        <div
                            id="color"
                            data-qa="settings_field_color"
                            tabIndex="0"
                            onFocus={this.togglePicker}
                            className="ColorPickerInput"
                            onClick={this.togglePicker}
                            title="Změnit barvu">
                            <div style={{ background: this.props.color }} />
                        </div>
                        {this.state.isPickerVisible ? (
                            <div
                                className="ColorPickerWindow"
                                onMouseLeave={this.closePicker}
                                onBlur={this.closePicker}>
                                <ChromePicker
                                    disableAlpha
                                    color={this.props.color}
                                    onChange={newColor => {
                                        this.props.onChange(newColor.hex)
                                        this.validateColor(newColor.hex)
                                    }}
                                />
                            </div>
                        ) : null}
                    </InputGroup>
                </Col>
            </Fragment>
        )
    }
}
