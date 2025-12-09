import * as chroma from "chroma-js"
import { CSSObjectWithLabel, StylesConfig } from "react-select"

import { CourseType } from "../../types/models"

// kolecko zobrazene v react-select
const dot = (color = "transparent"): CSSObjectWithLabel => ({
    alignItems: "center",
    display: "flex",
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ":before": {
        backgroundColor: color,
        borderRadius: 14,
        content: '" "',
        display: "block",
        marginRight: 8,
        height: 14,
        width: 14,
    },
})

/**
 * Konfigurace stylů pro react-select přidávající barevné kolečko k jednotlivým položkám.
 *
 * Vychází z: https://react-select.com/home#custom-styles
 */
export const selectStyles: StylesConfig<CourseType> = {
    control: (styles) => ({ ...styles, backgroundColor: "white" }),
    option: (styles, { data, isFocused, isSelected }) => {
        const color = chroma(data.color)
        return {
            ...styles,
            backgroundColor: isSelected
                ? data.color
                : isFocused
                  ? color.alpha(0.1).css()
                  : undefined,
            color: isSelected
                ? chroma.contrast(color, "white") > 2
                    ? "white"
                    : "black"
                : data.color,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            ":active": {
                ...styles[":active"],
                backgroundColor: isSelected ? data.color : color.alpha(0.3).css(),
            },
        }
    },
    input: (styles) => ({ ...styles, ...dot() }),
    placeholder: (styles) => ({ ...styles, ...dot("#ccc") }),
    singleValue: (styles, { data }) => ({
        ...styles,
        ...dot(data.color),
    }),
}
