import * as React from "react"

import { mb0 } from "../global/utility.css"
import { ErrMsg } from "../types/types"

type Props = {
    /** Element s chybovou zprávou. */
    text?: ErrMsg
}

/** Komponenta zobrazující obsah notifikace. */
const Notification: React.FC<Props> = ({ text = "" }) => {
    return <p className={mb0}>{text}</p>
}

export default Notification
