import * as React from "react"
import GroupService from "../api/services/GroupService"
import { noop } from "../global/utils"
import { GroupType } from "../types/models"
import { fEmptyVoid, fFunction } from "../types/types"

type StateContext = {
    isLoaded: boolean
    groups: Array<GroupType>
}

type State = StateContext & {
    loadRequested: boolean
}

type Context = StateContext & {
    funcRefresh: (callback?: fFunction) => void
    funcHardRefresh: fEmptyVoid
}

/** Context pro přístup a práci s aktivními skupinami. */
const GroupsActiveContext = React.createContext<Context>({
    groups: [],
    funcRefresh: noop,
    funcHardRefresh: noop,
    isLoaded: false
})

export class GroupsActiveProvider extends React.Component<{}, State> {
    state: State = {
        loadRequested: false,
        isLoaded: false,
        groups: []
    }

    getGroups = (callback = noop): void => {
        // pokud jeste nikdo nepozadal o nacteni skupin, pozadej a nacti je
        if (!this.state.loadRequested)
            this.setState({ loadRequested: true }, () => {
                GroupService.getActive().then(groups =>
                    this.setState(
                        {
                            groups,
                            isLoaded: true
                        },
                        callback
                    )
                )
            })
    }

    hardRefreshGroups = (): void => {
        // pokud uz je v pameti nactena stara verze skupin, obnov je (pokud k nacteni jeste nedoslo, nic nedelej)
        if (this.state.loadRequested)
            this.setState({ isLoaded: false }, () => {
                GroupService.getActive().then(groups =>
                    this.setState({
                        groups,
                        isLoaded: true
                    })
                )
            })
    }

    render = (): React.ReactNode => (
        <GroupsActiveContext.Provider
            value={{
                groups: this.state.groups,
                funcRefresh: this.getGroups,
                funcHardRefresh: this.hardRefreshGroups,
                isLoaded: this.state.isLoaded
            }}>
            {this.props.children}
        </GroupsActiveContext.Provider>
    )
}

export type GroupsActiveContextProps = {
    groupsActiveContext: Context
}

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
