import { configure } from "@testing-library/dom"
import "@testing-library/jest-dom"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import * as data from "./__mocks__/data.json"

configure({ testIdAttribute: "data-qa" })

export const handlers = [
    http.get("/api/v1/lectures/", () => {
        return HttpResponse.json(data.lectures)
    }),
]

export const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
