import { useMutation } from "@tanstack/react-query"

import { LecturePostApi, LecturePutApi, LectureType } from "../../types/models"
import LectureService from "../services/LectureService"

/** Hook pro vytvoření lekce. */
export function useCreateLecture() {
    return useMutation<LectureType, unknown, LecturePostApi | LecturePostApi[]>({
        mutationFn: (data) => LectureService.create(data),
    })
}

/** Hook pro aktualizaci lekce. */
export function useUpdateLecture() {
    return useMutation<LectureType, unknown, LecturePutApi>({
        mutationFn: (data) => LectureService.update(data),
    })
}

/** Hook pro smazání lekce. */
export function useDeleteLecture() {
    return useMutation<LectureType, unknown, LectureType["id"]>({
        mutationFn: (id) => LectureService.remove(id),
    })
}
