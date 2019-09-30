import React, { useState } from "react"
import { CustomInput } from "reactstrap"

/* CustomCustomInput doplnuje reactstrap komponentu CustomInput (pro type="select") o stav
   indikujici otevrene/zavrene dropdown menu pro umozneni zpracovani ESC kvuli modalnim oknum
    - viz https://github.com/rodlukas/UP-admin/issues/84
 */
const CustomCustomInput = props => {
    const [menuIsOpen, setMenuIsOpen] = useState(false)
    return (
        <CustomInput
            {...props}
            onKeyUp={e => {
                // pokud je ESC keyUp a je otevrene dropdown menu (menuIsOpen je true),
                // zastav propagaci eventu a priznak otevreneho menu (menuIsOpen) zrus
                if (e.key === "Escape" && menuIsOpen) {
                    e.stopPropagation()
                    setMenuIsOpen(false)
                }
            }}
            onClick={() => {
                // uzivatel otevrel dropdown menu, projev to do stavu
                setMenuIsOpen(prevMenuIsOpen => !prevMenuIsOpen)
            }}
        />
    )
}

export default CustomCustomInput
