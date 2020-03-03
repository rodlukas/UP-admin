import * as React from "react"
import { Props } from "react-select"
import { CourseType } from "../../types/models"
import CustomReactSelect from "./CustomReactSelect"
import { reactSelectIds } from "./func"
import { selectStyles } from "./selectCourseColors"

type SelectCourseProps = Props<CourseType> & {
    onChangeCallback: (name: "course", newValue: CourseType | undefined | null) => void
}

const SelectCourse: React.FunctionComponent<SelectCourseProps> = ({
    value,
    onChangeCallback,
    options,
    isDisabled = false
}) => (
    <CustomReactSelect<CourseType>
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
