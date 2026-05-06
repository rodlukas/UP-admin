import { Button, ButtonProps } from "@mantine/core"
import * as React from "react"

type Props = Omit<ButtonProps, "content" | "children"> & {
    /** Text v tlačítku. */
    content?: string
    /** Zobraz načítací animaci v tlačítku (true). */
    loading?: boolean
    /** Tlačítko není aktivní (true). */
    disabled?: boolean
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    id?: string
}

/** Tlačítko pro odeslání formuláře v aplikaci. */
const SubmitButton: React.FC<Props> = ({
    content,
    loading = false,
    disabled = false,
    ...props
}) => (
    <Button
        color="blue"
        ml="auto"
        type="submit"
        loading={loading}
        aria-busy={loading}
        {...props}
        disabled={loading || disabled}>
        {content}
    </Button>
)

export default SubmitButton
