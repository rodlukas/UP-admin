import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { render, screen } from "@testing-library/react"
import * as React from "react"

import MockContexts from "../../__mocks__/MockContexts"
import { createQueryClient } from "../api/queryClient"
import { createTestRouter } from "../testUtils/createTestRouter"

import DashboardDay from "./DashboardDay"

test("dashboard day shows lectures for a specific date", async () => {
    const queryClient = createQueryClient()
    const router = await createTestRouter(
        <MockContexts>
            <DashboardDay date="2020-09-09" withoutWaiting={true} />
        </MockContexts>,
    )
    render(
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>,
    )
    await screen.findAllByTestId("loading")
    const items = await screen.findAllByTestId("lecture")
    expect(items.length).toBe(2)
})
