/* eslint-disable @typescript-eslint/no-unsafe-argument */
import * as chroma from "chroma-js"
import * as CSS from "csstype"

// typ viz https://github.com/frenic/csstype#usage
type CSSTypes = Partial<Record<CSS.Pseudos, CSS.Properties<string | number>>> &
    CSS.Properties<string | number>

// kolecko zobrazene v react-select
const dot = (color = "transparent"): CSSTypes => ({
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
export const selectStyles = {
    control: (styles: CSSTypes) => ({ ...styles, backgroundColor: "white" }),
    option: (styles: CSSTypes, { data, isFocused, isSelected }: any) => {
        const color = chroma(data.color)
        return {
            ...styles,
            backgroundColor: isSelected ? data.color : isFocused ? color.alpha(0.1).css() : null,
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
    input: (styles: CSSTypes) => ({ ...styles, ...dot() }),
    placeholder: (styles: CSSTypes) => ({ ...styles, ...dot("#ccc") }),
    singleValue: (styles: CSSTypes, { data }: any) => ({ ...styles, ...dot(data.color) }),
}
