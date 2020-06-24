import * as React from "react"
import { Col, Row } from "reactstrap"
import "./Heading.css"

type Props = {
    /** Jakýkoliv uzel JSX tvořící nadpis. */
    title: React.ReactNode
    /** Jakýkoliv uzel JSX tvořící tlačítka. */
    buttons?: React.ReactNode
    /** Indikátor nadpisu v kontejneru fluid (pro jiné zarovnání). */
    fluid?: boolean
}

/** Komponenta pro jednotné zobrazení nadpisu stránky napříč aplikací. */
const Heading: React.FC<Props> = ({ title, buttons, fluid = false }) => (
    <Row className="justify-content-sm-end my-3 Heading align-items-center">
        <Col md={6} className={fluid ? "text-md-right" : ""}>
            <h1>{title}</h1>
        </Col>
        <Col
            md={6}
            className={`${fluid ? "text-right text-md-left" : "text-right"} HeadingButtons`}>
            {buttons}
        </Col>
    </Row>
)

export default Heading
