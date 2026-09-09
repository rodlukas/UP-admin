import * as React from "react"

import { useActiveGroups } from "../api/hooks"
import { useAuthContext } from "../auth/AuthContext"
import { useContextWithProvider } from "../hooks/useContextWithProvider"
import { GroupType } from "../types/models"

type Context = {
    /** Probíhá první načítání dat (true) - data ještě nejsou načtená. */
    isLoading: boolean
    /** Data se úspěšně načetla. Prázdné pole při `false` znamená chybu, ne prázdný seznam. */
    isSuccess: boolean
    /** Pole s aktivními skupinami. */
    groups: GroupType[]
}

type GroupsActiveContextInterface = Context | undefined

/** Context pro přístup a práci s aktivními skupinami. */
const GroupsActiveContext = React.createContext<GroupsActiveContextInterface>(undefined)

/** Provider kontextu s aktivními skupinami. */
export const GroupsActiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuth } = useAuthContext()
    const { data: groups = [], isLoading, isSuccess } = useActiveGroups(isAuth)

    return (
        <GroupsActiveContext.Provider
            value={{
                groups,
                isLoading,
                isSuccess,
            }}>
            {children}
        </GroupsActiveContext.Provider>
    )
}

export const useGroupsActiveContext = (): Context => useContextWithProvider(GroupsActiveContext)

export { GroupsActiveContext }
