import * as React from "react"
import { Button, ButtonProps } from "reactstrap"

const CancelButton: React.FunctionComponent<ButtonProps> = ({ onClick }) => (
    <Button color="secondary" onClick={onClick}>
        Storno
    </Button>
)

export default CancelButton
