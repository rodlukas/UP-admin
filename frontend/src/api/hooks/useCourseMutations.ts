import { useMutation } from "@tanstack/react-query"

import { CoursePostApi, CoursePutApi, CourseType } from "../../types/models"
import CourseService from "../services/CourseService"

/** Hook pro vytvoření kurzu. */
export function useCreateCourse() {
    return useMutation<CourseType, unknown, CoursePostApi>({
        mutationFn: (data) => CourseService.create(data),
    })
}

/** Hook pro aktualizaci kurzu. */
export function useUpdateCourse() {
    return useMutation<CourseType, unknown, CoursePutApi>({
        mutationFn: (data) => CourseService.update(data),
    })
}

/** Hook pro smazání kurzu. */
export function useDeleteCourse() {
    return useMutation<CourseType, unknown, CourseType["id"]>({
        mutationFn: (id) => CourseService.remove(id),
    })
}
