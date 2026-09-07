import { MantineProvider } from "@mantine/core"
import * as React from "react"

import { AttendanceStatesContext } from "../src/contexts/AttendanceStatesContext"
import { ClientsActiveContext } from "../src/contexts/ClientsActiveContext"
import { GroupsActiveContext } from "../src/contexts/GroupsActiveContext"

import * as data from "./data.json"

const MockContexts: React.FC<{ children: React.ReactNode }> = (props) => (
    <MantineProvider>
        <ClientsActiveContext.Provider
            value={{
                clients: data.clients,
                isLoading: false,
                isSuccess: true,
            }}>
            <GroupsActiveContext.Provider
                value={{
                    groups: data.groups,
                    isLoading: false,
                    isSuccess: true,
                }}>
                <AttendanceStatesContext.Provider
                    value={{
                        attendancestates: data.attendancestates,
                        isLoading: false,
                    }}>
                    {props.children}
                </AttendanceStatesContext.Provider>
            </GroupsActiveContext.Provider>
        </ClientsActiveContext.Provider>
    </MantineProvider>
)

export default MockContexts
