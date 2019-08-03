import chroma from "chroma-js"

export const dot = (color = '#ccc') => ({
    alignItems: 'center',
    display: 'flex',

    ':before': {
        backgroundColor: color,
        borderRadius: 14,
        content: '" "',
        display: 'block',
        marginRight: 8,
        height: 14,
        width: 14,
    },
})

export const selectStyles = {
    control: styles => ({...styles, backgroundColor: 'white'}),
    option: (styles, {data, isFocused, isSelected}) => {
        const color = chroma(data.color)
        return {
            ...styles,
            backgroundColor: isSelected
                ? data.color
                : isFocused
                    ? color.alpha(0.1).css()
                    : null,
            color: isSelected
                ? chroma.contrast(color, 'white') > 2
                    ? 'white'
                    : 'black'
                : data.color,
            ':active': {
                ...styles[':active'],
                backgroundColor: isSelected ? data.color : color.alpha(0.3).css(),
            },
        }
    },
    input: styles => ({...styles, ...dot()}),
    placeholder: styles => ({...styles, ...dot()}),
    singleValue: (styles, {data}) => ({...styles, ...dot(data.color)}),
}
