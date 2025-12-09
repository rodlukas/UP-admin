import * as React from "react"
import Select, { components, InputProps, Props } from "react-select"

import { TEXTS } from "../../global/constants"

/**
 * Vlastní Input komponenta pro vlastní řešení chování react-select při stisku ESC.
 * Řeší problém, kdy po stisku ESC dojde jak ke zavření možností, tak celého modálního okna.
 * Viz https://github.com/rodlukas/UP-admin/issues/84
 */
const Input = <Option, IsMulti extends boolean = false>(
    props: InputProps<Option, IsMulti>,
): JSX.Element => {
    const [menuWasOpen, setMenuWasOpen] = React.useState(false)
    const propsWithTypes = props

    // v oficialnim API neni onKeyUp a onKeyDown a selectProps pro Input dostupne
    // onKeyDown je dostupny jen na Select, onKeyDown ale korektne funguji, selectProps je v realu soucasti Props
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    return (
        <components.Input
            {...propsWithTypes}
            // @ts-ignore
            onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>): void => {
                // pokud je ESC keyUp a bylo predtim nastavene menu (menuWasOpen je true),
                // zastav propagaci eventu a priznak otevreneho menu (menuWasOpen) zrus
                if (e.key === "Escape" && menuWasOpen) {
                    e.stopPropagation()
                    setMenuWasOpen(false)
                }
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>): void => {
                // pokud se stiskl ESC a menu bylo otevrene - projev to do stavu,
                // pri keyUp je potreba zastavit propagaci eventu
                // @ts-ignore
                if (e.key === "Escape" && propsWithTypes.selectProps.menuIsOpen) {
                    setMenuWasOpen(true)
                }
            }}
        />
    )
    /* eslint-enable @typescript-eslint/ban-ts-comment */
}

const FOCUS_BORDER_COLOR = "#80bdff"
const FOCUS_BOX_SHADOW = "0 0 0 0.2rem rgba(0, 123, 255, 0.25)"

/** Wrapper pro react-select komponentu pro použití nadefinovaného react-selectu napříč aplikací. */
const ReactSelectWrapper = <Option, IsMulti extends boolean = false>(
    props: Props<Option, IsMulti>,
): JSX.Element => (
    <Select<Option, IsMulti>
        {...props}
        styles={{
            ...props.styles,
            ...{
                // Boostrap4 styling pro react-select
                control: (provided, state) => {
                    const focusStyles = state.isFocused
                        ? {
                              borderColor: FOCUS_BORDER_COLOR,
                              boxShadow: FOCUS_BOX_SHADOW,
                              outline: 0,
                          }
                        : {}

                    return {
                        ...provided,
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        "&:hover": {
                            boxShadow: state.isFocused ? FOCUS_BOX_SHADOW : "none",
                            outline: 0,
                        },
                        ...focusStyles,
                    }
                },
                menu: (provided) => ({ ...provided, zIndex: 2 }),
            },
        }}
        noOptionsMessage={(): string => TEXTS.NO_RESULTS}
        components={{ Input }}
    />
)

export default ReactSelectWrapper
