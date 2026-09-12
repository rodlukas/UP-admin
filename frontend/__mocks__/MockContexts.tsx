import { MantineProvider } from "@mantine/core"
import * as React from "react"

import { AttendanceStatesContext } from "../src/contexts/AttendanceStatesContext"
import { ClientsActiveContext } from "../src/contexts/ClientsActiveContext"
import { CoursesVisibleContext } from "../src/contexts/CoursesVisibleContext"
import { GroupsActiveContext } from "../src/contexts/GroupsActiveContext"
import { theme } from "../src/theme/theme"

import * as data from "./data.json"

// `theme` musí jít i sem — bez něj by žádný component test neprošel přes vlastní
// nastavení z theme.ts (min. velikost textu, dark-mode kontrasty, ...), takže by
// je nezachytil ani při regresi.
const MockContexts: React.FC<{ children: React.ReactNode }> = (props) => (
    <MantineProvider theme={theme}>
        <ClientsActiveContext.Provider
            value={{
                clients: data.clients,
                isLoading: false,
                isSuccess: true,
                hasData: true,
            }}>
            <GroupsActiveContext.Provider
                value={{
                    groups: data.groups,
                    isLoading: false,
                    isSuccess: true,
                    hasData: true,
                }}>
                <AttendanceStatesContext.Provider
                    value={{
                        attendancestates: data.attendancestates,
                        isLoading: false,
                        hasData: true,
                    }}>
                    <CoursesVisibleContext.Provider
                        value={{
                            courses: data.courses,
                            isLoading: false,
                            hasData: true,
                        }}>
                        {props.children}
                    </CoursesVisibleContext.Provider>
                </AttendanceStatesContext.Provider>
            </GroupsActiveContext.Provider>
        </ClientsActiveContext.Provider>
    </MantineProvider>
)

export default MockContexts
