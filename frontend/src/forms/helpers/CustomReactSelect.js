import React, { useState } from "react"
import Select, { components } from "react-select"
import { TEXTS } from "../../global/constants"

/* Input komponenta pro vlastni reseni chovani react-selectu pri stisku ESC
    - viz https://github.com/rodlukas/UP-admin/issues/84
 */
const Input = props => {
    const [menuWasOpen, setMenuWasOpen] = useState(false)

    return (
        <components.Input
            {...props}
            onKeyUp={e => {
                // pokud je ESC keyUp a bylo predtim nastavene menu (menuWasOpen je true),
                // zastav propagaci eventu a priznak otevreneho menu (menuWasOpen) zrus
                if (e.key === "Escape" && menuWasOpen) {
                    e.stopPropagation()
                    setMenuWasOpen(false)
                }
            }}
            onKeyDown={e => {
                // pokud se stiskl ESC a menu bylo otevrene, pri keyUp je potreba zastavit propagaci eventu
                if (e.key === "Escape" && props.selectProps.menuIsOpen) {
                    setMenuWasOpen(true)
                }
            }}
        />
    )
}

const CustomReactSelect = props => (
    <Select
        {...props}
        noOptionsMessage={() => TEXTS.NO_RESULTS}
        components={{
            Input
        }}
    />
)

export default CustomReactSelect
