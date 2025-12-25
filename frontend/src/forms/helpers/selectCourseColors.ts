import chroma from "chroma-js"
import { CSSObjectWithLabel, StylesConfig } from "react-select"

import { CourseType } from "../../types/models"

const PLACEHOLDER_DOT_COLOR = "#ccc"

// kolecko zobrazene v react-select
const dot = (color = "transparent"): CSSObjectWithLabel => ({
    alignItems: "center",
    display: "flex",
     
    ":before": {
        backgroundColor: color,
        borderRadius: 14,
        content: '" "',
        display: "block",
        marginRight: 8,
        height: 14,
        width: 14,
        // v input komponente dochazi ke shrinku a z dot fakt fazoli nechceme!
        flexShrink: 0,
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
             
            ":active": {
                ...styles[":active"],
                backgroundColor: isSelected ? data.color : color.alpha(0.3).css(),
            },
        }
    },
    // Ta podminka vypada trochu divne, ale je to proto, ze value mame jen tehdy, kdyz je neco rozepsane v inputu,
    // po vyberu option uz value zase nemame, my tedy pri psani chceme videt placeholder barvu a kdykoliv jinak bud barvu optiony,
    // nebo barvu z placeholderu nize.
    // React-select v3 zde fungoval trochu jinak a podminka tu nebyla potreba, kdybychom tu ale placli barvu natvrdo, tak nam prekryje barvu optiony.
    input: (styles, { value }) => ({
        ...styles,
        ...dot(value ? PLACEHOLDER_DOT_COLOR : "transparent"),
    }),
    placeholder: (styles) => ({ ...styles, ...dot(PLACEHOLDER_DOT_COLOR) }),
    singleValue: (styles, { data }) => ({
        ...styles,
        ...dot(data.color),
    }),
}
