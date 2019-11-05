import React, { Fragment } from "react"
import { UncontrolledTooltip } from "reactstrap"
import "./Circle.css"

const Circle = ({ color, size, showTitle = false }) => {
    const sizeWithUnit = size + "rem"
    const colorWithoutHash = color.substring(1)

    return (
        <Fragment>
            <span
                data-qa="course_color"
                className="circle"
                id={"Circle" + colorWithoutHash}
                style={{
                    background: color,
                    width: sizeWithUnit,
                    height: sizeWithUnit
                }}
            />
            {showTitle && (
                <UncontrolledTooltip target={"Circle" + colorWithoutHash}>
                    Kód barvy: {color}
                </UncontrolledTooltip>
            )}
        </Fragment>
    )
}

export default Circle
