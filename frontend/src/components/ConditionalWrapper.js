// @flow
import React from "react"

type Props = {
    condition: boolean,
    wrapper: (children: any) => any,
    children: any
}

const ConditionalWrapper = ({condition, wrapper, children}: Props) =>
    condition ? wrapper(children) : children

export default ConditionalWrapper
