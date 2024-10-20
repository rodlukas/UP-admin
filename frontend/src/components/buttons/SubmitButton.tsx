import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinnerThird } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"
import { Button, ButtonProps } from "reactstrap"

type Props = ButtonProps & {
    /** Text v tlačítku. */
    content?: string
    /** Zobraz načítací animaci v tlačítku (true). */
    loading?: boolean
    /** Tlačítko není aktivní (true). */
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
        className="float-end"
        type="submit"
        {...props}
        disabled={loading || disabled}>
        {content}
        {loading && <FontAwesomeIcon icon={faSpinnerThird} size="lg" spin className="ml-2" />}
    </Button>
)

export default SubmitButton
