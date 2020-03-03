import * as React from "react"
import { Button, ButtonProps } from "reactstrap"

/** Tlačítko pro storno v rámci aplikace. */
const CancelButton: React.FC<ButtonProps> = ({ onClick }) => (
    <Button color="secondary" onClick={onClick}>
        Storno
    </Button>
)

export default CancelButton
