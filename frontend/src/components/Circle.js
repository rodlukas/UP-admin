import React, { Fragment } from "react"
import "./Circle.css"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

const Circle = ({ color, size, showTitle = false }) => {
    const sizeWithUnit = size + "rem"
    const colorWithoutHash = color.substring(1)

    return (
        <Fragment>
            <span
                data-qa="course_color"
                className="circle"
                id={"Circle_" + colorWithoutHash}
                style={{
                    background: color,
                    width: sizeWithUnit,
                    height: sizeWithUnit
                }}
            />
            {showTitle && (
                <UncontrolledTooltipWrapper target={"Circle_" + colorWithoutHash}>
                    Kód barvy: {color}
                </UncontrolledTooltipWrapper>
            )}
        </Fragment>
    )
}

export default Circle
