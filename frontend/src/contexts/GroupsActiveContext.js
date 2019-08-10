import React, { Component, createContext } from "react"
import GroupService from "../api/services/group"

const GroupsActiveContext = createContext({
    groups: [],
    funcRefresh: () => {},
    funcHardRefresh: () => {},
    isLoaded: false
})

export class GroupsActiveProvider extends Component {
    state = {
        loadRequested: false,
        isLoaded: false,
        groups: []
    }

    getGroups = (callback = () => {}) => {
        // pokud jeste nikdo nepozadal o nacteni skupin, pozadej a nacti je
        if (!this.state.loadRequested)
            this.setState({ loadRequested: true }, () =>
                GroupService.getActive().then(groups =>
                    this.setState(
                        {
                            groups,
                            isLoaded: true
                        },
                        callback
                    )
                )
            )
    }

    hardRefreshGroups = () => {
        // pokud uz je v pameti nactena stara verze skupin, obnov je (pokud k nacteni jeste nedoslo, nic nedelej)
        if (this.state.loadRequested)
            this.setState({ isLoaded: false }, () =>
                GroupService.getActive().then(groups =>
                    this.setState({
                        groups,
                        isLoaded: true
                    })
                )
            )
    }

    render = () => (
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

const WithGroupsActiveContext = WrappedComponent => props => (
    <GroupsActiveContext.Consumer>
        {groupsActiveContext => (
            <WrappedComponent {...props} groupsActiveContext={groupsActiveContext} />
        )}
    </GroupsActiveContext.Consumer>
)

export { WithGroupsActiveContext, GroupsActiveContext }
