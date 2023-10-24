import { render, screen } from "@testing-library/react"
import * as React from "react"
import { Router } from "react-router-dom"

import MockContexts from "../../__mocks__/MockContexts"
import { DASHBOARDDAY_UPDATE_TYPE } from "../global/constants"
import history from "../global/history"
import { noop } from "../global/utils"

import DashboardDay from "./DashboardDay"

test("dashboard day shows lectures for a specific date", async () => {
    render(
        <Router history={history}>
            <MockContexts>
                <DashboardDay
                    date="2020-09-09"
                    updateType={DASHBOARDDAY_UPDATE_TYPE.NONE}
                    setUpdateType={noop}
                    withoutWaiting={true}
                />
            </MockContexts>
        </Router>,
    )
    await screen.findAllByTestId("loading")
    const items = await screen.findAllByTestId("lecture")
    expect(items.length).toBe(2)
})
