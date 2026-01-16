import * as React from "react"

import { pageTitle } from "../global/utils"
type PageProps = {
    title?: string
    children?: React.ReactNode
}

/** Komponenta zajišťující zobrazení jakékoliv stránky aplikace spolu s příslušným title v prohlížeči. */
const Page: React.FC<PageProps> = ({ title, children }) => {
    React.useEffect(() => {
        // nastav title stranky, pokud je pozadovan (jinak si jej potomek resi sam)
        if (title) {
            document.title = pageTitle(title)
        }
    }, [title])

    return <>{children}</>
}

export default Page
