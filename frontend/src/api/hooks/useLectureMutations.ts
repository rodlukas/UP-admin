import { useMutation, useQueryClient } from "@tanstack/react-query"

import { LecturePostApi, LecturePutApi, LectureType } from "../../types/models"
import LectureService from "../services/LectureService"

/** Hook pro vytvoření lekce. */
export function useCreateLecture() {
    const queryClient = useQueryClient()

    return useMutation<LectureType, unknown, LecturePostApi | LecturePostApi[]>({
        mutationFn: (data) => LectureService.create(data),
        onSuccess: (data) => {
            void queryClient.invalidateQueries({ queryKey: ["lectures"] })
            if (data.group) {
                void queryClient.invalidateQueries({ queryKey: ["groups"] })
            }
        },
    })
}

/** Hook pro aktualizaci lekce. */
export function useUpdateLecture() {
    const queryClient = useQueryClient()

    return useMutation<LectureType, unknown, LecturePutApi>({
        mutationFn: (data) => LectureService.update(data),
        onSuccess: (data) => {
            queryClient.setQueryData(["lectures", data.id], data)
            void queryClient.invalidateQueries({ queryKey: ["lectures"] })
            if (data.group) {
                void queryClient.invalidateQueries({ queryKey: ["groups"] })
            }
        },
    })
}

/** Hook pro smazání lekce. */
export function useDeleteLecture() {
    const queryClient = useQueryClient()

    return useMutation<LectureType, unknown, LectureType["id"]>({
        mutationFn: (id) => LectureService.remove(id),
        onSuccess: (data) => {
            void queryClient.invalidateQueries({ queryKey: ["lectures"] })
            if (data.group) {
                void queryClient.invalidateQueries({ queryKey: ["groups"] })
            }
        },
    })
}
