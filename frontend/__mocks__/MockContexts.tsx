import * as React from "react"

import { AttendanceStatesContext } from "../src/contexts/AttendanceStatesContext"
import { ClientsActiveContext } from "../src/contexts/ClientsActiveContext"
import { GroupsActiveContext } from "../src/contexts/GroupsActiveContext"

import * as data from "./data.json"

const MockContexts: React.FC<{ children: React.ReactNode }> = (props) => (
    <ClientsActiveContext.Provider
        value={{
            clients: data.clients,
            isLoading: false,
            isFetching: false,
        }}>
        <GroupsActiveContext.Provider
            value={{
                groups: data.groups,
                isLoading: false,
                isFetching: false,
            }}>
            <AttendanceStatesContext.Provider
                value={{
                    attendancestates: data.attendancestates,
                    isLoading: false,
                    isFetching: false,
                }}>
                {props.children}
            </AttendanceStatesContext.Provider>
        </GroupsActiveContext.Provider>
    </ClientsActiveContext.Provider>
)

export default MockContexts
