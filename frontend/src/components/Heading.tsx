import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinnerThird } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import classNames from "classnames"
import * as React from "react"
import { Col, Row } from "reactstrap"

import styles from "./Heading.module.css"

type Props = {
    /** Jakýkoliv uzel JSX tvořící nadpis. */
    title: React.ReactNode
    /** Jakýkoliv uzel JSX tvořící tlačítka. */
    buttons?: React.ReactNode
    /** Indikátor nadpisu v kontejneru fluid (pro jiné zarovnání). */
    fluid?: boolean
    /** Probíhá načítání dat na pozadí (true) - zobrazí spinner v nadpisu. */
    isFetching?: boolean
}

/** Komponenta pro jednotné zobrazení nadpisu stránky napříč aplikací. */
const Heading: React.FC<Props> = ({ title, buttons, fluid = false, isFetching = false }) => (
    <Row
        className={classNames(
            "justify-content-sm-end",
            "my-3",
            styles.heading,
            "align-items-center",
        )}>
        <Col md={6} className={classNames({ "text-md-right": fluid })}>
            <h1>
                {title}
                {isFetching && (
                    <FontAwesomeIcon
                        icon={faSpinnerThird}
                        spin
                        size="sm"
                        className="ml-2 text-muted"
                        data-qa="loading"
                    />
                )}
            </h1>
        </Col>
        <Col
            md={6}
            className={classNames({ "text-md-left": fluid }, styles.headingButtons, "text-right")}>
            {buttons}
        </Col>
    </Row>
)

export default Heading
