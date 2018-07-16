import React from "react"
import {Button} from "reactstrap"

const BackButton = ({onClick}) =>
    <Button color="secondary" className="nextBtn" onClick={onClick}>
        Jít zpět
    </Button>

export default BackButton
