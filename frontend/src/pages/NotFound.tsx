import * as React from "react"
import APP_URLS from "../APP_URLS"
import Heading from "../components/Heading"

/** Stránka, na kterou se uživatel dostane při neexistující stránce/objektu. */
const NotFound: React.FC = () => (
    <div className="text-center">
        <Heading content={APP_URLS.nenalezeno.title} />
        <p className="pageContent">Stránka nebo hledaný objekt neexistuje!</p>
    </div>
)

export default NotFound
