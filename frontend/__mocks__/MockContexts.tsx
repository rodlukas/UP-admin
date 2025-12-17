import * as React from "react"

import { AttendanceStatesContext } from "../src/contexts/AttendanceStatesContext"
import { ClientsActiveContext } from "../src/contexts/ClientsActiveContext"
import { GroupsActiveContext } from "../src/contexts/GroupsActiveContext"
import { noop } from "../src/global/utils"

import * as data from "./data.json"

const MockContexts: React.FC = (props) => (
    <ClientsActiveContext.Provider
        value={{
            clients: data.clients,
            isLoaded: true,
            isLoading: false,
            isFetching: false,
        }}>
        <GroupsActiveContext.Provider
            value={{
                groups: data.groups,
                isLoaded: true,
                isLoading: false,
                isFetching: false,
            }}>
            <AttendanceStatesContext.Provider
                value={{
                    attendancestates: data.attendancestates,
                    funcRefresh: noop,
                    isLoaded: true,
                    isFetching: false,
                }}>
                {props.children}
            </AttendanceStatesContext.Provider>
        </GroupsActiveContext.Provider>
    </ClientsActiveContext.Provider>
)

export default MockContexts
