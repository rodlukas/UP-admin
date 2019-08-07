// @flow
import React, {Fragment} from "react"

type Props = {
    condition: boolean,
    wrapper: (children: any) => any,
    children: any
}

const ConditionalWrapper = ({condition, wrapper, children}: Props) =>
    condition ? wrapper(children) : <Fragment>{children}</Fragment>

export default ConditionalWrapper
