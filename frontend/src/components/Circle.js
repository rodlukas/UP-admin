import React from "react"
import "./Circle.css"

const Circle = ({ color, size, showTitle = false }) => {
    const sizeWithUnit = size + "rem"

    return (
        <div
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
