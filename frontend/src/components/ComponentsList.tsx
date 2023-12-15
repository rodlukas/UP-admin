import * as React from "react"

type Props = {
    /** Pole jakýchkoliv komponent. */
    components: React.ReactNode[]
}

/** Obecná komponenta zajišťující výpis pole komponent oddělených čárkami. */
const ComponentsList: React.FC<Props> = ({ components }) => (
    <>{components.reduce((prev, curr) => [prev, ", ", curr])}</>
)

export default ComponentsList
