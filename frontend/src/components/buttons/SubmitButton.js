import { faSpinnerThird } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"
import { Button } from "reactstrap"

const SubmitButton = ({ content, loading = false, disabled = false, ...props }) => (
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
