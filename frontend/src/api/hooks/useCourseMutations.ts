import { useMutation, useQueryClient } from "@tanstack/react-query"

import { CoursePostApi, CoursePutApi, CourseType } from "../../types/models"
import CourseService from "../services/CourseService"

/** Hook pro vytvoření kurzu. */
export function useCreateCourse() {
    const queryClient = useQueryClient()

    return useMutation<CourseType, unknown, CoursePostApi>({
        mutationFn: (data) => CourseService.create(data),
        onSuccess: () => {
            // Invalidovat cache pro kurzy (invaliduje i ["courses", "visible"], atd.)
            void queryClient.invalidateQueries({ queryKey: ["courses"] })
            // Invalidovat skupiny, protože změna kurzu může ovlivnit skupiny
            void queryClient.invalidateQueries({ queryKey: ["groups"] })
        },
    })
}

/** Hook pro aktualizaci kurzu. */
export function useUpdateCourse() {
    const queryClient = useQueryClient()

    return useMutation<CourseType, unknown, CoursePutApi>({
        mutationFn: (data) => CourseService.update(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["courses"] })
            void queryClient.invalidateQueries({ queryKey: ["groups"] })
        },
    })
}

/** Hook pro smazání kurzu. */
export function useDeleteCourse() {
    const queryClient = useQueryClient()

    return useMutation<CourseType, unknown, CourseType["id"]>({
        mutationFn: (id) => CourseService.remove(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["courses"] })
            void queryClient.invalidateQueries({ queryKey: ["groups"] })
        },
    })
}
