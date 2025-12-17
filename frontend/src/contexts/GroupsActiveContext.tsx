import * as React from "react"

import { useActiveGroups } from "../api/hooks"
import { useAuthContext } from "../auth/AuthContext"
import { getDisplayName } from "../global/utils"
import { useContextWithProvider } from "../hooks/useContextWithProvider"
import { GroupType } from "../types/models"

type StateContext = {
    /** Data v kontextu jsou načtená (true). */
    isLoaded: boolean
    /** Probíhá první načítání dat (true) - data ještě nejsou načtená. */
    isLoading: boolean
    /** Probíhá načítání dat na pozadí (true). */
    isFetching: boolean
    /** Pole s aktivními skupinami. */
    groups: GroupType[]
}

type Context = StateContext

type GroupsActiveContextInterface = Context | undefined

/** Context pro přístup a práci s aktivními skupinami. */
const GroupsActiveContext = React.createContext<GroupsActiveContextInterface>(undefined)

/** Provider kontextu s aktivními skupinami. */
export const GroupsActiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuth } = useAuthContext()
    const { data: groups = [], isLoading, isFetching } = useActiveGroups(isAuth)

    return (
        <GroupsActiveContext.Provider
            value={{
                groups,
                isLoaded: !isLoading && !isFetching,
                isLoading,
                isFetching,
            }}>
            {children}
        </GroupsActiveContext.Provider>
    )
}

/** Props kontextu s aktivními skupinami při využití HOC. */
export type GroupsActiveContextProps = {
    /** Objekt kontextu s aktivními skupinami. */
    groupsActiveContext: Context
}

/** Interně je v contextu hodnota nebo undefined, ošetřujeme to přes errory. */
type GroupsActiveContextPropsInternal = {
    groupsActiveContext: GroupsActiveContextInterface
}

type ComponentWithGroupsActiveContextProps<P> = Omit<P, keyof GroupsActiveContextPropsInternal>

/** HOC komponenta pro kontext s aktivními skupinami. */
const WithGroupsActiveContext = <P,>(
    WrappedComponent: React.ComponentType<P>,
): React.ComponentType<ComponentWithGroupsActiveContextProps<P>> => {
    const ComponentWithGroupsActiveContext = (props: ComponentWithGroupsActiveContextProps<P>) => (
        <GroupsActiveContext.Consumer>
            {(groupsActiveContext) => {
                if (groupsActiveContext === undefined) {
                    throw new Error(
                        "groupsActiveContext must be used within a GroupsActiveProvider",
                    )
                }
                return (
                    <WrappedComponent {...(props as P)} groupsActiveContext={groupsActiveContext} />
                )
            }}
        </GroupsActiveContext.Consumer>
    )
    ComponentWithGroupsActiveContext.displayName = `WithGroupsActiveContext(${getDisplayName<P>(
        WrappedComponent,
    )})`
    return ComponentWithGroupsActiveContext
}

export const useGroupsActiveContext = (): Context => useContextWithProvider(GroupsActiveContext)

export { WithGroupsActiveContext, GroupsActiveContext }
