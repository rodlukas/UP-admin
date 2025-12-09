import { Props } from "react-select"

/** Vrátí identifikátory pro react-select (používané pro Selenium). */
export function reactSelectIds<OptionType>(id: string): Props<OptionType> {
    return {
        inputId: id,
        classNamePrefix: id,
    }
}
