import * as React from "react"
import GroupService from "../api/services/GroupService"
import { noop } from "../global/utils"
import { GroupType } from "../types/models"
import { fEmptyVoid, fFunction } from "../types/types"

type StateContext = {
    /** Data v kontextu jsou načtená (true). */
    isLoaded: boolean
    /** Pole s aktivními skupinami. */
    groups: Array<GroupType>
}

type State = StateContext & {
    /** Načtení dat do kontextu už bylo vyžádáno (true). */
    loadRequested: boolean
}

type Context = StateContext & {
    /** Funkce pro načtení dat do kontextu, pokud ještě o načtení nikdo nepožádal. */
    funcRefresh: (callback?: fFunction) => void
    /** Funkce pro obnovení již načtených dat v kontextu. */
    funcHardRefresh: fEmptyVoid
}

/** Context pro přístup a práci s aktivními skupinami. */
const GroupsActiveContext = React.createContext<Context>({
    groups: [],
    funcRefresh: noop,
    funcHardRefresh: noop,
    isLoaded: false,
})

/** Provider kontextu s aktivními skupinami. */
export class GroupsActiveProvider extends React.Component<{}, State> {
    state: State = {
        loadRequested: false,
        isLoaded: false,
        groups: [],
    }

    getGroups = (callback = noop): void => {
        // pokud jeste nikdo nepozadal o nacteni skupin, pozadej a nacti je
        if (!this.state.loadRequested) {
            this.setState({ loadRequested: true }, () => {
                GroupService.getActive().then((groups) =>
                    this.setState(
                        {
                            groups,
                            isLoaded: true,
                        },
                        callback
                    )
                )
            })
        }
    }

    hardRefreshGroups = (): void => {
        // pokud uz je v pameti nactena stara verze skupin, obnov je (pokud k nacteni jeste nedoslo, nic nedelej)
        if (this.state.loadRequested) {
            this.setState({ isLoaded: false }, () => {
                GroupService.getActive().then((groups) =>
                    this.setState({
                        groups,
                        isLoaded: true,
                    })
                )
            })
        }
    }

    render = (): React.ReactNode => (
        <GroupsActiveContext.Provider
            value={{
                groups: this.state.groups,
                funcRefresh: this.getGroups,
                funcHardRefresh: this.hardRefreshGroups,
                isLoaded: this.state.isLoaded,
            }}>
            {this.props.children}
        </GroupsActiveContext.Provider>
    )
}

/** Props kontextu s aktivními skupinami při využití HOC. */
export type GroupsActiveContextProps = {
    /** Objekt kontextu s aktivními skupinami. */
    groupsActiveContext: Context
}

/** HOC komponenta pro kontext s aktivními skupinami. */
const WithGroupsActiveContext = <P,>(
    WrappedComponent: React.ComponentType<P>
): React.ComponentType<Omit<P, keyof GroupsActiveContextProps>> => (props): React.ReactElement => (
    <GroupsActiveContext.Consumer>
        {(groupsActiveContext): React.ReactNode => (
            <WrappedComponent {...(props as P)} groupsActiveContext={groupsActiveContext} />
        )}
    </GroupsActiveContext.Consumer>
)

export { WithGroupsActiveContext, GroupsActiveContext }
