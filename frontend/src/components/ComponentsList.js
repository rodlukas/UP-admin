const List = ({ components }) => components.reduce((prev, curr) => [prev, ", ", curr])

export default List
