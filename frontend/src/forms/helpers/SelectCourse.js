import React from "react"
import Select from "react-select"
import { TEXTS } from "../../global/constants"
import { react_select_ids } from "./func"
import { selectStyles } from "./selectCourseColors"

const SelectCourse = ({ value, onChangeCallback, options, isDisabled = false }) => (
    <Select
        {...react_select_ids("course")}
        value={value}
        getOptionLabel={option => option.name}
        getOptionValue={option => option.id}
        onChange={newValue => onChangeCallback(newValue, "course")}
        options={options}
        placeholder={"Vyberte kurz..."}
        noOptionsMessage={() => TEXTS.NO_RESULTS}
        styles={selectStyles}
        required
        isDisabled={isDisabled}
    />
)

export default SelectCourse
