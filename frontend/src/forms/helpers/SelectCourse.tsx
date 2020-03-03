import * as React from "react"
import { Props } from "react-select"
import { CourseType } from "../../types/models"
import { reactSelectIds } from "./func"
import ReactSelectWrapper from "./ReactSelectWrapper"
import { selectStyles } from "./selectCourseColors"

type SelectCourseProps = Props<CourseType> & {
    onChangeCallback: (name: "course", newValue?: CourseType | null) => void
}

/** Komponenta s react-select pro kurz. */
const SelectCourse: React.FC<SelectCourseProps> = ({
    value,
    onChangeCallback,
    options,
    isDisabled = false
}) => (
    <ReactSelectWrapper<CourseType>
        {...reactSelectIds("course")}
        value={value}
        getOptionLabel={(option): string => option.name}
        getOptionValue={(option): string => option.id.toString()}
        onChange={(newValue): void =>
            onChangeCallback("course", newValue as CourseType | undefined | null)
        }
        options={options}
        placeholder={"Vyberte kurz..."}
        styles={selectStyles}
        required
        isDisabled={isDisabled}
    />
)

export default SelectCourse
