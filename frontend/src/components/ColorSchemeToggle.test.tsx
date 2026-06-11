import { MantineProvider } from "@mantine/core"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"

import ColorSchemeToggle from "./ColorSchemeToggle"

// env="test" vypina transitions a hideDetached (v jsdom maji elementy nulove rozmery,
// floating-ui by jinak dropdown menu skryl pres display: none);
// defaultColorScheme="auto" odpovida realne aplikaci (index.tsx)
const renderColorSchemeToggle = () =>
    render(
        <MantineProvider env="test" defaultColorScheme="auto">
            <ColorSchemeToggle />
        </MantineProvider>,
    )

const openMenu = async (): Promise<HTMLElement[]> => {
    fireEvent.click(screen.getByRole("button", { name: "Přepnout barevné schéma" }))
    return await screen.findAllByRole("menuitemradio")
}

afterEach(() => {
    // color scheme prezije unmount (localStorage + atribut na <html>), testy se musi izolovat
    window.localStorage.clear()
    document.documentElement.removeAttribute("data-mantine-color-scheme")
})

test("shows a menu item per scheme with the active one checked", async () => {
    renderColorSchemeToggle()

    const items = await openMenu()

    expect(items.map((item) => item.textContent)).toEqual(["Systém", "Světlý", "Tmavý"])
    // vychozi schema aplikace je auto (Systém) → prave jedna polozka je aria-checked
    expect(screen.getByRole("menuitemradio", { name: "Systém" })).toBeChecked()
    expect(screen.getByRole("menuitemradio", { name: "Světlý" })).not.toBeChecked()
    expect(screen.getByRole("menuitemradio", { name: "Tmavý" })).not.toBeChecked()
})

test("switches color scheme to dark on click", async () => {
    renderColorSchemeToggle()

    await openMenu()
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Tmavý" }))

    await waitFor(() =>
        expect(document.documentElement).toHaveAttribute("data-mantine-color-scheme", "dark"),
    )

    // po znovuotevreni menu je zaskrtnuta tmava polozka
    const items = await openMenu()
    const checkedLabels = items
        .filter((item) => item.getAttribute("aria-checked") === "true")
        .map((item) => item.textContent)
    expect(checkedLabels).toEqual(["Tmavý"])
})
