import * as React from "react"
import { toast, TypeOptions as ToastTypeOptions } from "react-toastify"

import { ErrMsg } from "../types/types"

type Props = {
    /** Element s chybovou zprávou. */
    text?: ErrMsg
    /** Typ toast notifikace. */
    type: ToastTypeOptions
}

/** Komponenta zobrazující úroveň upozornění v rámci notifikace. */
const Notification: React.FC<Props> = ({ text = "", type }) => {
    let heading = ""
    switch (type) {
        case toast.TYPE.ERROR:
            heading = "⛔ CHYBA"
            break
        case toast.TYPE.WARNING:
            heading = "⚠️ UPOZORNĚNÍ"
            break
        case toast.TYPE.SUCCESS:
            heading = "✅ ÚSPĚŠNĚ ULOŽENO"
            break
    }

    return (
        <>
            <h6 className="fw-bold">{heading}</h6>
            {text}
        </>
    )
}

export default Notification
