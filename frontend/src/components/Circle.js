import React from "react"
import "./Circle.css"

const Circle = ({ color, size, showTitle = false }) => {
    const sizeWithUnit = size + "rem"

    return (
        <span
            data-qa="course_color"
            className="circle"
            style={{
                background: color,
                width: sizeWithUnit,
                height: sizeWithUnit
            }}
            title={showTitle ? color : undefined}
        />
    )
}

export default Circle
