import React from "react"
import Select from "react-select"
import {TEXTS} from "../../global/constants"
import {selectStyles} from "./SelectCourseColors"

const SelectCourse = ({value, onChangeCallback, options, isDisabled = false}) =>
    <Select
        inputId="course"
        value={value}
        getOptionLabel={option => option.name}
        getOptionValue={option => option.id}
        onChange={newValue => onChangeCallback(newValue, "course")}
        options={options}
        placeholder={"Vyberte kurz..."}
        noOptionsMessage={() => TEXTS.NO_RESULTS}
        styles={selectStyles}
        required
        isDisabled={isDisabled}/>

export default SelectCourse
