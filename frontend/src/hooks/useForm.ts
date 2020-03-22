import * as React from "react"
import { fFunction } from "../types/types"

type Element = HTMLInputElement | HTMLTextAreaElement

type ChangeEventType = React.ChangeEvent<Element>
type FormEventType = React.FormEvent<HTMLFormElement>

type UseForm<T> = readonly [T, (e: ChangeEventType) => void, (e: FormEventType) => void]

/**
 * Hook pro jednoduchou práci s formulářem.
 * Vychází z: https://upmostly.com/tutorials/using-custom-react-hooks-simplify-forms/
 */
const useForm = <T>(initState: T, callback: fFunction): UseForm<T> => {
    const [values, setValues] = React.useState(initState)

    const handleChange = (e: ChangeEventType): void => {
        const target = e.currentTarget
        setValues((prevValues) => ({
            ...prevValues,
            [target.id]: target.value,
        }))
    }

    const handleSubmit = (e: FormEventType): void => {
        if (e) e.preventDefault()
        callback()
    }

    return [values, handleChange, handleSubmit] as const
}

export default useForm
