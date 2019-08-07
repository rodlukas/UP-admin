import React from "react"
import Heading from "../components/Heading"
import APP_URLS from "../urls"

const NotFound = () =>
    <div className="text-center">
        <Heading content={APP_URLS.nenalezeno.title}/>
        <p className="pageContent">
            Stránka nebo hledaný objekt neexistuje!
        </p>
    </div>

export default NotFound
