import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { act, render, screen, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import * as React from "react"

import { server } from "../../vitest.setup"
import { createTestRouter } from "../testUtils/createTestRouter"

import { AuthProvider, useAuthContext } from "./AuthContext"
import Token from "./Token"

const REFRESH_URL = "/api/v1/jwt-refresh/"

/** Nepodepsaný JWT s danou zbývající platností - frontend podpis neověřuje, čte jen `exp`. */
function makeToken(secondsLeft: number): string {
    const encode = (part: object): string =>
        btoa(JSON.stringify(part)).replaceAll("=", "").replaceAll("+", "-").replaceAll("/", "_")
    const exp = Math.floor(Date.now() / 1000) + secondsLeft
    return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ exp, username: "u", email: "" })}.sig`
}

let isAuthenticated: ((refreshExpiringToken?: boolean) => Promise<void>) | undefined

const Probe: React.FC = () => {
    const context = useAuthContext()
    isAuthenticated = context.isAuthenticated
    return <span data-qa="is-auth">{String(context.isAuth)}</span>
}

async function renderAuth(): Promise<void> {
    const queryClient = new QueryClient()
    const router = await createTestRouter(
        <AuthProvider>
            <Probe />
        </AuthProvider>,
    )
    render(
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>,
    )
    await screen.findByTestId("is-auth")
}

async function refresh(): Promise<void> {
    await act(async () => {
        await isAuthenticated?.()
    })
}

describe("AuthContext - obnovení tokenu", () => {
    // 30 minut: token ještě platí, ale je pod prahem pro obnovení (65 minut)
    const expiringToken = makeToken(30 * 60)

    beforeEach(() => {
        Token.save(expiringToken)
    })

    afterEach(() => {
        Token.remove()
    })

    test("token odmítnutý serverem smaže, aby se přihlášení a stránka nepřehazovaly dokola", async () => {
        server.use(
            http.post(REFRESH_URL, () =>
                HttpResponse.json({ detail: "Uživatel nenalezen" }, { status: 401 }),
            ),
        )
        await renderAuth()

        await refresh()

        expect(Token.get()).toBeNull()
        expect(screen.getByTestId("is-auth")).toHaveTextContent("false")
        // tohle volá `Login` po přesměrování - se smazaným tokenem nesmí přihlášení vrátit
        await act(async () => {
            await isAuthenticated?.(false)
        })
        expect(screen.getByTestId("is-auth")).toHaveTextContent("false")
    })

    test("při výpadku sítě token nechá a uživatele neodhlásí", async () => {
        server.use(http.post(REFRESH_URL, () => HttpResponse.error()))
        await renderAuth()

        await refresh()

        expect(Token.get()).toBe(expiringToken)
        expect(screen.getByTestId("is-auth")).toHaveTextContent("true")
    })

    test("obnovený token uloží", async () => {
        const newToken = makeToken(3 * 60 * 60)
        server.use(http.post(REFRESH_URL, () => HttpResponse.json({ token: newToken })))
        await renderAuth()

        await refresh()

        await waitFor(() => expect(Token.get()).toBe(newToken))
        expect(screen.getByTestId("is-auth")).toHaveTextContent("true")
    })
})
