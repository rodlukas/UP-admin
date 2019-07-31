import React, {Fragment} from "react"
import {toast} from "react-toastify"

const Notification = ({text = "", type}) => {
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
        <Fragment>
            <h6 className="font-weight-bold">
                {heading}
            </h6>
            {text}
        </Fragment>)
}

export default Notification
