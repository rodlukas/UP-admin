import { render, screen } from "@testing-library/react"
import * as React from "react"
import AppDate from "./AppDate"

test("shows date and time", () => {
    render(<AppDate />)
    expect(screen.getByText("%GIT_DATETIME")).toBeInTheDocument()
})
