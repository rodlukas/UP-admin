import { render, screen } from "@testing-library/react"
import * as React from "react"
import { Router } from "react-router-dom"
import * as data from "../../__mocks__/data.json"
import { AttendanceStatesContext } from "../contexts/AttendanceStatesContext"
import { DASHBOARDDAY_UPDATE_TYPE } from "../global/constants"
import history from "../global/history"
import { noop } from "../global/utils"
import DashboardDay from "./DashboardDay"

test("dashboard day shows lectures for a specific date", async () => {
    render(
        <Router history={history}>
            <AttendanceStatesContext.Provider
                value={{
                    attendancestates: data.attendancestates,
                    funcRefresh: noop,
                    isLoaded: true,
                }}>
                <DashboardDay
                    date="2020-09-09"
                    updateType={DASHBOARDDAY_UPDATE_TYPE.NONE}
                    setUpdateType={noop}
                    withoutWaiting={true}
                />
            </AttendanceStatesContext.Provider>
        </Router>
    )
    await screen.findAllByTestId("loading")
    const items = await screen.findAllByTestId("lecture")
    expect(items.length).toBe(2)
})
