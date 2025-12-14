import { useQuery } from "@tanstack/react-query"

import { CourseType } from "../../types/models"
import CourseService from "../services/CourseService"

/** Hook pro získání všech kurzů. */
export function useCourses() {
    return useQuery<CourseType[]>({
        queryKey: ["courses"],
        queryFn: () => CourseService.getAll(),
    })
}

/** Hook pro získání viditelných kurzů. */
export function useVisibleCourses() {
    return useQuery<CourseType[]>({
        queryKey: ["courses", { type: "visible" }],
        queryFn: () => CourseService.getVisible(),
    })
}
