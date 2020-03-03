import * as React from "react"
import Select, { components, InputProps, Props } from "react-select"
import { TEXTS } from "../../global/constants"

/* Input komponenta pro vlastni reseni chovani react-selectu pri stisku ESC
    - viz https://github.com/rodlukas/UP-admin/issues/84
 */
const Input: React.FunctionComponent<InputProps> = props => {
    const [menuWasOpen, setMenuWasOpen] = React.useState(false)
    const propsWithTypes = props

    // v oficialnim API neni onKeyUp a onKeyDown a selectProps pro Input dostupne
    // onKeyDown je dostupny jen na Select, onKeyDown ale korektne funguji, selectProps je v realu soucasti Props
    /* eslint-disable @typescript-eslint/ban-ts-ignore */
    return (
        <components.Input
            {...propsWithTypes}
            // @ts-ignore
            onKeyUp={(e: KeyboardEvent): void => {
                // pokud je ESC keyUp a bylo predtim nastavene menu (menuWasOpen je true),
                // zastav propagaci eventu a priznak otevreneho menu (menuWasOpen) zrus
                if (e.key === "Escape" && menuWasOpen) {
                    e.stopPropagation()
                    setMenuWasOpen(false)
                }
            }}
            onKeyDown={(e: KeyboardEvent): void => {
                // pokud se stiskl ESC a menu bylo otevrene - projev to do stavu,
                // pri keyUp je potreba zastavit propagaci eventu
                // @ts-ignore
                if (e.key === "Escape" && propsWithTypes.selectProps.menuIsOpen) {
                    setMenuWasOpen(true)
                }
            }}
        />
    )
    /* eslint-enable @typescript-eslint/ban-ts-ignore */
}

const CustomReactSelect = <OptionType,>(props: Props<OptionType>): JSX.Element => (
    <Select<OptionType>
        {...props}
        noOptionsMessage={(): string => TEXTS.NO_RESULTS}
        components={{
            Input
        }}
    />
)

export default CustomReactSelect
