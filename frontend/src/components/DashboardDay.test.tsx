import { QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import * as React from "react"
import { BrowserRouter } from "react-router-dom"

import MockContexts from "../../__mocks__/MockContexts"
import { createQueryClient } from "../api/queryClient"

import DashboardDay from "./DashboardDay"

test("dashboard day shows lectures for a specific date", async () => {
    const queryClient = createQueryClient()
    render(
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <MockContexts>
                    <DashboardDay date="2020-09-09" withoutWaiting={true} />
                </MockContexts>
            </BrowserRouter>
        </QueryClientProvider>,
    )
    await screen.findAllByTestId("loading")
    const items = await screen.findAllByTestId("lecture")
    expect(items.length).toBe(2)
})
