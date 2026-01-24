import * as React from "react"

/** Výchozí zpoždění pro requesty při rychlém překlikávání (ms). */
export const DEFAULT_DELAY = 500

/** Časový interval, během kterého se změny považují za "rychlé" (ms). */
const RAPID_CHANGE_THRESHOLD = 500

/**
 * Hook pro zpožděnou aktualizaci hodnoty.
 * Při normální navigaci se hodnota aktualizuje okamžitě.
 * Při rychlém překlikávání (změny během krátkého časového okna) se hodnota zpozdí,
 * aby se neposílaly zbytečné requesty.
 *
 * @param value - Hodnota, která se má zpozdit
 * @param delay - Zpoždění v milisekundách při rychlém překlikávání (výchozí: 500ms)
 * @param immediate - Pokud true, hodnota se vždy aktualizuje okamžitě bez zpoždění
 * @returns Zpožděná hodnota
 */
export function useDelayedValue<T>(value: T, delay: number = DEFAULT_DELAY, immediate = false): T {
    const [delayedValue, setDelayedValue] = React.useState<T>(value)
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const lastChangeTimeRef = React.useRef<number>(Date.now())

    React.useEffect(() => {
        const cleanup = (): void => {
            if (timeoutRef.current !== undefined) {
                globalThis.clearTimeout(timeoutRef.current)
            }
        }

        cleanup()

        if (immediate) {
            setDelayedValue(value)
            lastChangeTimeRef.current = Date.now()
        } else {
            const now = Date.now()
            const timeSinceLastChange = now - lastChangeTimeRef.current

            // Pokud je to rychlá změna (během krátkého časového okna), použij zpoždění
            if (timeSinceLastChange < RAPID_CHANGE_THRESHOLD) {
                timeoutRef.current = globalThis.setTimeout(() => {
                    setDelayedValue(value)
                    lastChangeTimeRef.current = Date.now()
                }, delay)
            } else {
                // Normální navigace - aktualizuj okamžitě
                setDelayedValue(value)
                lastChangeTimeRef.current = now
            }
        }

        return cleanup
    }, [value, delay, immediate])

    return delayedValue
}
