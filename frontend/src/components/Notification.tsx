import * as React from "react"
import { TypeOptions as ToastTypeOptions } from "react-toastify"

import { ErrMsg } from "../types/types"

type Props = {
    /** Element s chybovou zprávou. */
    text?: ErrMsg
    /** Typ toast notifikace. */
    type: ToastTypeOptions
}

/** Komponenta zobrazující obsah notifikace. */
const Notification: React.FC<Props> = ({ text = "" }) => {
    return <p className="mb-0">{text}</p>
}

export default Notification
