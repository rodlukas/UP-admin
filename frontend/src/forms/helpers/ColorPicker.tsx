import { faPalette } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as chroma from "chroma-js"
import * as React from "react"
import { ChromePicker } from "react-color"
import { toast } from "react-toastify"
import { Col, InputGroup, InputGroupAddon, Label } from "reactstrap"
import Notification from "../../components/Notification"
import UncontrolledTooltipWrapper from "../../components/UncontrolledTooltipWrapper"
import "./ColorPicker.css"

type Props = {
    color: string
    onChange: (newColor: string) => void
}

type State = {
    isPickerVisible: boolean
}

/** Komponenta pro pole s výběrem barvy kurzu. */
export default class ColorPicker extends React.Component<Props, State> {
    state: State = {
        isPickerVisible: false,
    }

    static customToastId = "ColorPicker"

    togglePicker = (): void => {
        if (!this.state.isPickerVisible) {
            this.validateColor(this.props.color)
        }
        this.setState((prevState) => ({
            isPickerVisible: !prevState.isPickerVisible,
        }))
    }

    closePicker = (): void => {
        this.setState({ isPickerVisible: false })
        toast.dismiss(ColorPicker.customToastId)
    }

    validateColor = (color: string): void => {
        // pokud barvy nejsou dostatecne kontrastni a jeste neni zobrazene upozorneni, zobraz ho
        if (chroma.contrast(chroma(color), "white") < 2) {
            toast(
                <Notification
                    type={toast.TYPE.WARNING}
                    text="Zvolená barva je málo kontrastní k bílé a byla by špatně vidět, zvolte více kontrastnější."
                />,
                {
                    toastId: ColorPicker.customToastId,
                    autoClose: false,
                    type: toast.TYPE.WARNING,
                }
            )
        } else {
            toast.dismiss(ColorPicker.customToastId)
        }
    }

    render(): React.ReactNode {
        return (
            <>
                <Label for="color" sm={3} onClick={this.togglePicker}>
                    Barva
                </Label>
                <Col sm={9}>
                    <InputGroup>
                        <InputGroupAddon addonType="prepend">
                            <Label
                                className="input-group-text"
                                for="color"
                                onClick={this.togglePicker}>
                                <FontAwesomeIcon icon={faPalette} fixedWidth />
                            </Label>
                        </InputGroupAddon>
                        <button
                            id="color"
                            type="button"
                            data-qa="course_button_color"
                            onFocus={this.togglePicker}
                            className="ColorPickerInput"
                            onClick={this.togglePicker}>
                            <div style={{ background: this.props.color }} />
                        </button>
                        <UncontrolledTooltipWrapper placement="right" target="color">
                            Změnit barvu
                        </UncontrolledTooltipWrapper>
                        {this.state.isPickerVisible ? (
                            <div
                                className="ColorPickerWindow"
                                data-qa="course_color_picker"
                                onMouseLeave={this.closePicker}
                                onBlur={this.closePicker}>
                                <ChromePicker
                                    disableAlpha
                                    color={this.props.color}
                                    onChange={(newColor): void => {
                                        this.props.onChange(newColor.hex)
                                        this.validateColor(newColor.hex)
                                    }}
                                />
                            </div>
                        ) : null}
                    </InputGroup>
                </Col>
            </>
        )
    }
}
