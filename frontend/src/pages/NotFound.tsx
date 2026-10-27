import { Container } from "@mantine/core"
import * as React from "react"

import APP_URLS from "../APP_URLS"
import Heading from "../components/Heading"

/** Stránka, na kterou se uživatel dostane při neexistující stránce/objektu. */
const NotFound: React.FC = () => (
    <Container data-qa="page_not_found">
        <Heading title={APP_URLS.nenalezeno.title} />
        <p>Stránka nebo hledaný objekt neexistuje!</p>
    </Container>
)

export default NotFound
