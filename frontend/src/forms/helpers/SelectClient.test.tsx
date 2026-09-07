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

test("autoFocus (default) opens the dropdown immediately on mount", () => {
    renderWithMantine(<SelectClient onChangeCallback={vi.fn()} options={[client]} />)
    expect(screen.getByRole("listbox")).toBeInTheDocument()
})

test("autoFocus={false} does not open the dropdown on mount", () => {
    renderWithMantine(
        <SelectClient autoFocus={false} onChangeCallback={vi.fn()} options={[client]} />,
    )
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
})
