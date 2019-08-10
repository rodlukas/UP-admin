import { createBrowserHistory, createMemoryHistory } from "history"

// createMemoryHistory se pouzije, pokud aplikace nebezi v prohlizeci (server/test...)
let history = typeof window !== "undefined" ? createBrowserHistory() : createMemoryHistory()

export default history
