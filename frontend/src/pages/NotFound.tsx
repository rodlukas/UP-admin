import * as React from "react"
import Heading from "../components/Heading"
import APP_URLS from "../urls"

/** Stránka, na kterou se uživatel dostane při neexistující stránce/objektu. */
const NotFound: React.FunctionComponent = () => (
    <div className="text-center">
        <Heading content={APP_URLS.nenalezeno.title} />
        <p className="pageContent">Stránka nebo hledaný objekt neexistuje!</p>
    </div>
)

export default NotFound
