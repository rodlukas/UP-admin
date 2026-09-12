import { MantineProvider } from "@mantine/core"
import { render, screen } from "@testing-library/react"

import InfoTooltip from "./InfoTooltip"

const renderWithMantine = (ui: React.ReactElement) =>
    render(<MantineProvider>{ui}</MantineProvider>)

test("exposes the plain-string text as the accessible name", () => {
    renderWithMantine(<InfoTooltip text="Neaktivním skupinám nelze vytvořit lekci." />)

    expect(
        screen.getByRole("img", { name: "Neaktivním skupinám nelze vytvořit lekci." }),
    ).toBeInTheDocument()
})

test("uses the explicit ariaLabel as the accessible name for rich JSX content", () => {
    renderWithMantine(
        <InfoTooltip
            text={
                <>
                    Řádek jeden.
                    <br />
                    Řádek dva.
                </>
            }
            ariaLabel="Řádek jeden. Řádek dva."
        />,
    )

    expect(screen.getByRole("img", { name: "Řádek jeden. Řádek dva." })).toBeInTheDocument()
})
