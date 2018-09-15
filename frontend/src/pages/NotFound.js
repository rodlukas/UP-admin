import React from "react"
import Heading from "../components/Heading"

const HeadingContent = () =>
    "Nenalezeno"

const NotFound = () =>
    <div className="text-center">
        <Heading content={<HeadingContent/>}/>
        <p className="pageContent">
            Stránka nebo hledaný objekt neexistuje!
        </p>
    </div>

export default NotFound
