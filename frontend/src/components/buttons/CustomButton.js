import React from "react"
import {Button} from "reactstrap"

const CustomButton = ({onClick = () => {}, content = "", disabled = false, title = ""}) =>
    <Button color="secondary"
            disabled={disabled}
            title={title}
            onClick={onClick}>
        {content}
    </Button>

export default CustomButton
