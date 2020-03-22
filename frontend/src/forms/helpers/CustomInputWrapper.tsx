import * as React from "react"
import { CustomInput, CustomInputProps } from "reactstrap"

/**
 * Wrapper pro CustomInput z reactstrap (pro type="select") zajišťující korektní chování při stisku ESC,
 * když je otevřeno modální okno.
 * Původní komponentu doplňuje o stav indikující otevřené/zavřené dropdown menu pro umožnění zpracování ESC.
 *
 * Viz https://github.com/rodlukas/UP-admin/issues/84
 */
const CustomInputWrapper: React.FC<CustomInputProps> = (props) => {
    const [menuIsOpen, setMenuIsOpen] = React.useState(false)
    return (
        <CustomInput
            {...props}
            onKeyUp={(e): void => {
                // pokud je ESC keyUp a je otevrene dropdown menu (menuIsOpen je true),
                // zastav propagaci eventu a priznak otevreneho menu (menuIsOpen) zrus
                if (e.key === "Escape" && menuIsOpen) {
                    e.stopPropagation()
                    setMenuIsOpen(false)
                }
            }}
            onClick={(): void => {
                // uzivatel otevrel dropdown menu, projev to do stavu
                setMenuIsOpen((prevMenuIsOpen) => !prevMenuIsOpen)
            }}
        />
    )
}

export default CustomInputWrapper
