import * as React from "react"
import { toast } from "react-toastify"
import { ErrMsg } from "../types/types"

type Props = {
    text?: ErrMsg
    type: string
}

/** Komponenta zobrazující úroveň upozornění v rámci notifikace. */
const Notification: React.FunctionComponent<Props> = ({ text = "", type }) => {
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
