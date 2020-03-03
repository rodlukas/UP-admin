import * as React from "react"
import "./CourseCircle.css"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = {
    color: string
    size: number
    showTitle?: boolean
}

/** Komponenta zobrazující barevné kolečko s různou barvou a velikostí pro zobrazení barvy kurzu. */
const CourseCircle: React.FunctionComponent<Props> = ({ color, size, showTitle = false }) => {
    const sizeWithUnit = size + "rem"
    const colorWithoutHash = color.substring(1)

    return (
        <>
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
        </>
    )
}

export default CourseCircle
