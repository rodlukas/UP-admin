import { MantineProvider } from "@mantine/core"
import { render, screen } from "@testing-library/react"

import { ClientType } from "../../types/models"

import SelectClient from "./SelectClient"

const renderWithMantine = (ui: React.ReactElement) =>
    render(<MantineProvider>{ui}</MantineProvider>)

const client: ClientType = {
    id: 1,
    active: true,
    email: "klient@domena.cz",
    note: "",
    phone: "",
    firstname: "Jana",
    surname: "Nováková",
    last_lecture_date: null,
}

test("dropdown is not open on mount", () => {
    renderWithMantine(<SelectClient onChangeCallback={vi.fn()} options={[client]} />)
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
})
