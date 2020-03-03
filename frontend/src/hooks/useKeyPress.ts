import * as React from "react"

type UseKeyPress = boolean

/**
 * Hook pro detekování stisku klávesy uživatelem.
 * Vychází z: https://usehooks.com/useKeyPress/
 */
export default function useKeyPress(targetKey: string): UseKeyPress {
    // State for keeping track of whether key is pressed
    const [keyPressed, setKeyPressed] = React.useState(false)

    // Add event listeners
    React.useEffect(() => {
        // If pressed key is our target key then set to true
        function downHandler({ key }: KeyboardEvent): void {
            if (key === targetKey) {
                setKeyPressed(true)
            }
        }

        // If released key is our target key then set to false
        const upHandler = ({ key }: KeyboardEvent): void => {
            if (key === targetKey) {
                setKeyPressed(false)
            }
        }

        window.addEventListener("keydown", downHandler)
        window.addEventListener("keyup", upHandler)

        // Remove event listeners on cleanup
        return (): void => {
            window.removeEventListener("keydown", downHandler)
            window.removeEventListener("keyup", upHandler)
        }
    }, [targetKey]) // rerun the effect if the targetKey changes

    return keyPressed
}
