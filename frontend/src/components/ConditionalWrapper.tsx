import * as React from "react"

type Props = {
    /** Podmínka je splněna (true). */
    condition: boolean
    /** Komponenta, která při splnění podmínky danou původní komponentu obalí. */
    wrapper: (children: React.ReactNode) => React.ReactNode
    /** Komponenta, která je na základě podmínky (condition) obalena jinou komponentou (wrapper). */
    children: React.ReactNode
}

/** Obecná komponenta zajišťující obalení dané komponenty nějakým wrapperem za dané podmínky. */
const ConditionalWrapper: React.FC<Props> = ({ condition, wrapper, children }) =>
    condition ? <>{wrapper(children)}</> : <>{children}</>

export default ConditionalWrapper
