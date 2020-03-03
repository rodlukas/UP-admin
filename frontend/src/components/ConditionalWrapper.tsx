import * as React from "react"

type Props = {
    condition: boolean
    wrapper: (children: React.ReactNode) => React.ReactNode
    children: React.ReactNode
}

const ConditionalWrapper: React.FunctionComponent<Props> = ({ condition, wrapper, children }) =>
    condition ? <>{wrapper(children)}</> : <>{children}</>

export default ConditionalWrapper
