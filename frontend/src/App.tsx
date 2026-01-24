import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import * as React from "react"

import { AuthProvider } from "./auth/AuthContext"
import { ClientsActiveProvider } from "./contexts/ClientsActiveContext"
import { GroupsActiveProvider } from "./contexts/GroupsActiveContext"
import Main from "./Main"
import ErrorBoundary from "./pages/ErrorBoundary"

type AppLayoutProps = {
    queryClient: QueryClient
}

const AppLayout: React.FC<AppLayoutProps> = ({ queryClient }) => (
    <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
            <AuthProvider>
                <ClientsActiveProvider>
                    <GroupsActiveProvider>
                        <Main />
                    </GroupsActiveProvider>
                </ClientsActiveProvider>
            </AuthProvider>
        </ErrorBoundary>
        <ReactQueryDevtools initialIsOpen={false} />
        <TanStackRouterDevtools initialIsOpen={false} />
    </QueryClientProvider>
)

export default AppLayout
