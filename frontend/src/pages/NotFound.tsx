import * as React from "react"
import { Container } from "reactstrap"
import APP_URLS from "../APP_URLS"
import Heading from "../components/Heading"

/** Stránka, na kterou se uživatel dostane při neexistující stránce/objektu. */
const NotFound: React.FC = () => (
    <Container>
        <Heading title={APP_URLS.nenalezeno.title} />
        <p>Stránka nebo hledaný objekt neexistuje!</p>
    </Container>
)

export default NotFound
