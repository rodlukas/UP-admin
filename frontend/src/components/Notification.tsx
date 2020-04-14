import * as React from "react"
import { toast } from "react-toastify"
import { ErrMsg } from "../types/types"

//todo https://github.com/fkhadra/react-toastify/issues/426
type Props = {
    /** Element s chybovou zprávou. */
    text?: ErrMsg
    /** Typ toast notifikace. */
    type: string
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
            <h6 className="font-weight-bold">{heading}</h6>
            {text}
        </>
    )
}

export default Notification
