import React from "react"
import Heading from "../components/Heading"
import APP_URLS from "../urls"

const HeadingContent = () =>
    APP_URLS.nenalezeno.title

const NotFound = () =>
    <div className="text-center">
        <Heading content={<HeadingContent/>}/>
        <p className="pageContent">
            Stránka nebo hledaný objekt neexistuje!
        </p>
    </div>

export default NotFound
