import { render } from "@testing-library/react"
import * as React from "react"
import ClientEmail from "./ClientEmail"

test("shows email", () => {
    const { container } = render(<ClientEmail email="blabla@domena.cz" />)
    const ahref = container.querySelector("a")
    expect(ahref).toBeInTheDocument()
    expect(ahref).toHaveTextContent("blabla@domena.cz")
})

test("doesn't show empty email", () => {
    const { container } = render(<ClientEmail email="" />)
    const ahref = container.querySelector("a")
    expect(ahref).not.toBeInTheDocument()
})
