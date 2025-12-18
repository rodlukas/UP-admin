import * as React from "react"
import { toast, TypeOptions as ToastTypeOptions } from "react-toastify"

import { ErrMsg } from "../types/types"

type Props = {
    /** Element s chybovou zprávou. */
    text?: ErrMsg
    /** Typ toast notifikace. */
    type: ToastTypeOptions
    /** Vlastní nadpis notifikace. Pokud není zadán, použije se výchozí. */
    heading?: string
}

const NOTIFICATION_CONFIG: Partial<
    Record<ToastTypeOptions, { emoji: string; defaultHeading: string }>
> = {
    [toast.TYPE.ERROR]: { emoji: "⛔", defaultHeading: "CHYBA" },
    [toast.TYPE.WARNING]: { emoji: "⚠️", defaultHeading: "UPOZORNĚNÍ" },
    [toast.TYPE.SUCCESS]: { emoji: "✅", defaultHeading: "ULOŽENO" },
    [toast.TYPE.INFO]: { emoji: "ℹ️", defaultHeading: "INFO" },
    [toast.TYPE.DEFAULT]: { emoji: "", defaultHeading: "" },
}

/** Komponenta zobrazující úroveň upozornění v rámci notifikace. */
const Notification: React.FC<Props> = ({ text = "", type, heading: customHeading }) => {
    const { emoji, defaultHeading } = NOTIFICATION_CONFIG[type] ?? {
        emoji: "",
        defaultHeading: "",
    }
    const heading = customHeading ?? defaultHeading

    return (
        <>
            <h6 className="font-weight-bold">
                {emoji} {heading}
            </h6>
            {text}
        </>
    )
}

export default Notification
