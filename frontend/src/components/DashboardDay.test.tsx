import { QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import * as React from "react"
import { Router } from "react-router-dom"

import MockContexts from "../../__mocks__/MockContexts"
import { createQueryClient } from "../api/queryClient"
import { DASHBOARDDAY_UPDATE_TYPE } from "../global/constants"
import history from "../global/history"
import { noop } from "../global/utils"

import DashboardDay from "./DashboardDay"

test("dashboard day shows lectures for a specific date", async () => {
    const queryClient = createQueryClient()
    render(
        <QueryClientProvider client={queryClient}>
            <Router history={history}>
                <MockContexts>
                    <DashboardDay
                        date="2020-09-09"
                        updateType={DASHBOARDDAY_UPDATE_TYPE.NONE}
                        setUpdateType={noop}
                        withoutWaiting={true}
                    />
                </MockContexts>
            </Router>
        </QueryClientProvider>,
    )
    await screen.findAllByTestId("loading")
    const items = await screen.findAllByTestId("lecture")
    expect(items.length).toBe(2)
})
