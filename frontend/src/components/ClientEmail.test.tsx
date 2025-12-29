import { render, screen } from "@testing-library/react"
import * as React from "react"

import ClientEmail from "./ClientEmail"

test("shows email", () => {
    render(<ClientEmail email="blabla@domena.cz" />)
    const link = screen.getByRole("link", { name: "blabla@domena.cz" })
    expect(link).toBeInTheDocument()
    expect(link).toHaveTextContent("blabla@domena.cz")
    expect(link).toHaveAttribute("href", "mailto:blabla@domena.cz")
})

test("doesn't show empty email", () => {
    render(<ClientEmail email="" />)
    const link = screen.queryByRole("link")
    expect(link).not.toBeInTheDocument()
})
