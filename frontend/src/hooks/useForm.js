import { useState } from "react"

/**
 * Hook pro jednoduchou práci s formulářem.
 * Vychází z: https://upmostly.com/tutorials/using-custom-react-hooks-simplify-forms/
 */
const useForm = (initState, callback) => {
    const [values, setValues] = useState(initState)

    const handleSubmit = event => {
        if (event) event.preventDefault()
        callback()
    }

    const handleChange = event => {
        event.persist()
        setValues(prevValues => ({
            ...prevValues,
            [event.target.id]: event.target.value
        }))
    }

    return [values, handleChange, handleSubmit]
}

export default useForm
