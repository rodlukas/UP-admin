import * as React from "react"

type Props = {
    condition: boolean
    wrapper: (children: React.ReactNode) => React.ReactNode
    children: React.ReactNode
}

/** Obecná komponenta zajišťující obalení dané komponenty nějakým wrapperem za dané podmínky. */
const ConditionalWrapper: React.FunctionComponent<Props> = ({ condition, wrapper, children }) =>
    condition ? <>{wrapper(children)}</> : <>{children}</>

export default ConditionalWrapper
