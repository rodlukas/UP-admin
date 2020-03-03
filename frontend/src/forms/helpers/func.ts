import { Props } from "react-select"

export function reactSelectIds<OptionType>(id: string): Props<OptionType> {
    // vrati identifikatory pro react-select (pouzivaji se pro Selenium)
    return {
        inputId: id,
        classNamePrefix: id
    }
}
