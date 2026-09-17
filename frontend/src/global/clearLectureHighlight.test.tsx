import { RouterProvider, useNavigate } from "@tanstack/react-router"
import { act, fireEvent, render, screen } from "@testing-library/react"

import { createTestRouter } from "../testUtils/createTestRouter"

import { clearLectureHighlight } from "./clearLectureHighlight"

const Trigger = () => {
    const navigate = useNavigate()
    return (
        <button data-qa="clear" onClick={() => clearLectureHighlight(navigate)}>
            uklidit
        </button>
    )
}

async function clearOn(path: string) {
    const router = await createTestRouter(<Trigger />, { path })
    render(<RouterProvider router={router} />)
    fireEvent.click(screen.getByTestId("clear"))
    // navigace routeru je asynchronní, bez flushe by se stav ještě nestihl promítnout
    await act(async () => {
        await Promise.resolve()
    })
    return router.state.location.search
}

test("the lecture param is removed", async () => {
    expect(await clearOn("/?lecture=88")).toEqual({})
})

test("other search params survive the cleanup", async () => {
    // Úklid maže cíleně jen `lecture`, ne celý search: parametr, který `validateSearch` routy
    // nezmíní, projde routerem beze změny i na routě diáře (naměřeno — validace se přes syrový
    // search jen slučuje), takže `search: {}` by smazalo i to, co do URL přišlo odjinud.
    expect(await clearOn("/?lecture=88&other=7")).toEqual({ other: 7 })
})
