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
): React.ReactElement => {
    const [menuWasOpen, setMenuWasOpen] = React.useState(false)

    return (
        <components.Input
            {...props}
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
                if (e.key === "Escape" && props.selectProps.menuIsOpen) {
                    setMenuWasOpen(true)
                }
            }}
        />
    )
}

const FOCUS_BORDER_COLOR = "#86b7fe"
const FOCUS_BOX_SHADOW = "0 0 0 0.25rem rgba(13, 110, 253, 0.25)"
const BORDER_COLOR = "#dee2e6"

/** Wrapper pro react-select komponentu pro použití nadefinovaného react-selectu napříč aplikací. */
const ReactSelectWrapper = <Option, IsMulti extends boolean = false>(
    props: Props<Option, IsMulti>,
): React.ReactElement => (
    <Select<Option, IsMulti>
        {...props}
        styles={{
            ...props.styles,
            ...{
                // Boostrap 5 styling pro react-select
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
                        borderColor: BORDER_COLOR,
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
