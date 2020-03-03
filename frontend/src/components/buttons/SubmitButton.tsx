import { faSpinnerThird } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as React from "react"
import { Button, ButtonProps } from "reactstrap"

interface Props extends ButtonProps {
    content?: string
    loading?: boolean
    disabled?: boolean
}

/** Tlačítko pro odeslání formuláře v aplikaci. */
const SubmitButton: React.FC<Props> = ({
    content,
    loading = false,
    disabled = false,
    ...props
}) => (
    <Button
        color="primary"
        className="float-right"
        type="submit"
        {...props}
        disabled={loading || disabled}>
        {content}
        {loading && <FontAwesomeIcon icon={faSpinnerThird} size="lg" spin className="ml-2" />}
    </Button>
)

export default SubmitButton
