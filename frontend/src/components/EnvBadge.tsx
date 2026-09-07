import { Badge } from "@mantine/core"
import * as React from "react"

import { isEnvDemo, isEnvLocal, isEnvTesting } from "../global/funcEnvironments"

import AppCommit from "./AppCommit"

/**
 * `tt="none"` u testingu: výchozí uppercase Badge by překreslil commit hash na velká
 * písmena a vizuálně by neodpovídal `git log`/GitHubu. Commit se ukazuje jen tam —
 * u lokálního běhu a dema nic neidentifikuje.
 */
const ENVIRONMENTS = [
    {
        matches: isEnvTesting,
        label: "Testing",
        color: "blue",
        variant: "filled",
        withCommit: true,
    },
    {
        matches: isEnvDemo,
        label: "DEMO",
        color: "gray",
        variant: "filled",
        withCommit: false,
    },
    {
        matches: isEnvLocal,
        label: "Vývojová verze",
        color: "gray",
        variant: "light",
        withCommit: false,
    },
] as const

/**
 * Běží aplikace na prostředí, které se má označit? Ptá se na to pruh navigace, aby
 * na produkci nevykresloval prázdnou obálku — logika je záměrně tady, u zdroje pravdy.
 */
export const hasEnvBadge = (): boolean => ENVIRONMENTS.some((candidate) => candidate.matches())

/**
 * Označení prostředí, na kterém aplikace běží. Na produkci nevykreslí nic.
 *
 * Je to pojistka, ne dekorace: nad reálně vypadajícími daty musí být poznat, že se edituje
 * testing nebo demo. Proto je v patičce pruhu i ve slim hlavičce na mobilu, kde je pruh
 * zavřený drawer.
 */
const EnvBadge: React.FC = () => {
    const environment = ENVIRONMENTS.find((candidate) => candidate.matches())
    if (!environment) {
        return null
    }

    return (
        <Badge color={environment.color} variant={environment.variant} tt="none">
            {environment.label}
            {environment.withCommit && (
                <>
                    {" "}
                    <AppCommit />
                </>
            )}
        </Badge>
    )
}

export default EnvBadge
