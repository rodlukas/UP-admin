import { configure } from "@testing-library/dom"
import "@testing-library/jest-dom"
import { rest } from "msw"
import { setupServer } from "msw/node"
import * as data from "./__mocks__/data.json"

configure({ testIdAttribute: "data-qa" })

export const handlers = [
    rest.get("/api/v1/lectures/", (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(data.lectures))
    }),
]

export const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
