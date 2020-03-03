import * as React from "react"

type Props = {
    components: Array<React.ReactNode>
}

/** Obecná komponenta zajišťující výpis pole komponent oddělených čárkami. */
const ComponentsList: React.FC<Props> = ({ components }) => (
    <>{components.reduce((prev, curr) => [prev, ", ", curr])}</>
)

export default ComponentsList
