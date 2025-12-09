import { Props } from "react-select"

/** Vrátí identifikátory pro react-select (používané pro Selenium). */
export function reactSelectIds<OptionType>(
    id: string,
): Pick<Props<OptionType>, "inputId" | "classNamePrefix"> {
    return {
        inputId: id,
        classNamePrefix: id,
    }
}
