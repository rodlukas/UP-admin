import * as React from "react"

import { useActiveGroups } from "../api/hooks"
import { useAuthContext } from "../auth/AuthContext"
import { useContextWithProvider } from "../hooks/useContextWithProvider"
import { type GroupType } from "../types/models"

type Context = {
    /** Probíhá první načítání dat (true) - data ještě nejsou načtená. */
    isLoading: boolean
    /** Data se úspěšně načetla (`status === "success"`). */
    isSuccess: boolean
    /**
     * Data už někdy dorazila ze serveru — i prázdná. `false` znamená „zatím nenačteno"
     * (první načítání, chyba, offline), takže prázdné pole v takovém případě NENÍ prázdný
     * seznam. Na rozdíl od `isSuccess` přežije selhaný refetch: TanStack Query si při něm
     * data z cache nechá, jen překlopí `status` na „error".
     */
    hasData: boolean
    /** Pole s aktivními skupinami. */
    groups: GroupType[]
}

type GroupsActiveContextInterface = Context | undefined

/** Context pro přístup a práci s aktivními skupinami. */
const GroupsActiveContext = React.createContext<GroupsActiveContextInterface>(undefined)

/** Provider kontextu s aktivními skupinami. */
export const GroupsActiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuth } = useAuthContext()
    const { data, isLoading, isSuccess } = useActiveGroups(isAuth)
    // `useMemo`: bez nej je `data ?? []` pri kazdem renderu NOVE pole, takze memoizace
    // u konzumentu (`useDataTable` na stránce Skupiny a merge memo ve ModalLecturesWizard) nikdy netrefi
    const groups = React.useMemo(() => data ?? [], [data])

    return (
        <GroupsActiveContext.Provider
            value={{
                groups,
                isLoading,
                isSuccess,
                hasData: data !== undefined,
            }}>
            {children}
        </GroupsActiveContext.Provider>
    )
}

export const useGroupsActiveContext = (): Context => useContextWithProvider(GroupsActiveContext)

export { GroupsActiveContext }
