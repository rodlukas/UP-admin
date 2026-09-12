import { MantineProvider } from "@mantine/core"
import * as Sentry from "@sentry/browser"
import { RouterProvider } from "@tanstack/react-router"
import { fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"

import Token from "../auth/Token"
import { createTestRouter } from "../testUtils/createTestRouter"

import ErrorBoundaryWithLocation from "./ErrorBoundary"

vi.mock("@sentry/browser", () => ({
    captureException: vi.fn(() => "test-event-id"),
    withScope: vi.fn((callback: (scope: { setExtras: (extras: unknown) => void }) => void) =>
        callback({ setExtras: vi.fn() }),
    ),
    showReportDialog: vi.fn(),
}))

vi.mock("../auth/Token", () => ({
    default: {
        get: vi.fn(),
        getEmpty: vi.fn(() => ({ email: "", username: "", exp: 0 })),
        decodeToken: vi.fn(),
    },
}))

const showReportDialogMock = vi.mocked(Sentry.showReportDialog)
const tokenGetMock = vi.mocked(Token).get
const tokenDecodeMock = vi.mocked(Token).decodeToken

/** Komponenta, ktera pri renderu vzdy vyhodi chybu — spousti ErrorBoundary. */
const Boom: React.FC = () => {
    throw new Error("boom")
}

async function renderErrorBoundary(): Promise<void> {
    const router = await createTestRouter(
        <MantineProvider env="test">
            <ErrorBoundaryWithLocation>
                <Boom />
            </ErrorBoundaryWithLocation>
        </MantineProvider>,
    )
    render(<RouterProvider router={router} />)
}

describe("ErrorBoundary", () => {
    // React do konzole loguje i vyjimku, kterou boundary chyta — v testu je to sum, ne signal
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined)
    })

    afterEach(() => {
        consoleErrorSpy.mockRestore()
    })

    it("po kliknuti na 'Odeslat zpetnou vazbu' otevre Sentry report dialog s ID zachycene chyby", async () => {
        tokenGetMock.mockReturnValue(null)

        await renderErrorBoundary()

        expect(await screen.findByText("Chyba aplikace")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: /Odeslat zpětnou vazbu/i }))

        expect(showReportDialogMock).toHaveBeenCalledTimes(1)
        expect(showReportDialogMock).toHaveBeenCalledWith(
            expect.objectContaining({
                eventId: "test-event-id",
                title: "Došlo k chybě v aplikaci",
                user: { email: "", name: "" },
            }),
        )
    })

    it("predvyplni dialog jmenem a e-mailem z prihlasovaciho tokenu", async () => {
        tokenGetMock.mockReturnValue("fake-token")
        tokenDecodeMock.mockReturnValue({
            email: "test@example.com",
            username: "testuser",
            exp: 0,
        })

        await renderErrorBoundary()

        fireEvent.click(await screen.findByRole("button", { name: /Odeslat zpětnou vazbu/i }))

        expect(showReportDialogMock).toHaveBeenCalledWith(
            expect.objectContaining({
                user: { email: "test@example.com", name: "testuser" },
            }),
        )
    })
})
