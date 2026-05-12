import { MantineProvider } from "@mantine/core"
import { render, screen } from "@testing-library/react"

import ClientEmail from "./ClientEmail"

const renderWithMantine = (ui: React.ReactElement) => render(<MantineProvider>{ui}</MantineProvider>)

test("shows email", () => {
    renderWithMantine(<ClientEmail email="blabla@domena.cz" />)
    const link = screen.getByRole("link", { name: "blabla@domena.cz" })
    expect(link).toBeInTheDocument()
    expect(link).toHaveTextContent("blabla@domena.cz")
    expect(link).toHaveAttribute("href", "mailto:blabla@domena.cz")
})

test("doesn't show empty email", () => {
    renderWithMantine(<ClientEmail email="" />)
    const link = screen.queryByRole("link")
    expect(link).not.toBeInTheDocument()
})
