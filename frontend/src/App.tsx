import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import * as React from "react"

import { AuthProvider } from "./auth/AuthContext"
import TopProgressBar from "./components/TopProgressBar"
import { ClientsActiveProvider } from "./contexts/ClientsActiveContext"
import { GroupsActiveProvider } from "./contexts/GroupsActiveContext"
import Main from "./Main"
import ErrorBoundary from "./pages/ErrorBoundary"

type AppLayoutProps = {
    queryClient: QueryClient
}

const isDevelopment = process.env.NODE_ENV === "development"
const isDevtoolsEnabled =
    isDevelopment && new URLSearchParams(globalThis.location.search).has("devtools")

const AppLayout: React.FC<AppLayoutProps> = ({ queryClient }) => (
    <QueryClientProvider client={queryClient}>
        <TopProgressBar />
        <ErrorBoundary>
            <AuthProvider>
                <ClientsActiveProvider>
                    <GroupsActiveProvider>
                        <Main />
                    </GroupsActiveProvider>
                </ClientsActiveProvider>
            </AuthProvider>
        </ErrorBoundary>
        {isDevtoolsEnabled && (
            <>
                <ReactQueryDevtools initialIsOpen={false} />
                <TanStackRouterDevtools initialIsOpen={false} />
            </>
        )}
    </QueryClientProvider>
)

export default AppLayout
