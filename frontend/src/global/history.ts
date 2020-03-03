import { createBrowserHistory, createMemoryHistory } from "history"

/** Objekt pro práci s historií v aplikaci. */
// createMemoryHistory se pouzije, pokud aplikace nebezi v prohlizeci (server/test...)
const history = typeof window !== "undefined" ? createBrowserHistory() : createMemoryHistory()

export default history
