import { useMutation, useQueryClient } from "@tanstack/react-query"

import { LecturePostApi, LecturePutApi, LectureType } from "../../types/models"
import LectureService from "../services/LectureService"

/** Hook pro vytvoření lekce. */
export function useCreateLecture() {
    const queryClient = useQueryClient()

    return useMutation<LectureType, unknown, LecturePostApi | LecturePostApi[]>({
        mutationFn: (data) => LectureService.create(data),
        onSuccess: (data) => {
            // Invalidovat cache pro lekce (invaliduje i ["lectures", "group", ...], ["lectures", "client", ...], ["lectures", "day", ...], atd.)
            void queryClient.invalidateQueries({ queryKey: ["lectures"] })
            // Pokud se jedná o skupinovou lekci, invalidovat také cache pro skupiny (kvůli aktualizaci prepaid_cnt)
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
            // Aktualizovat konkrétní lekci v cache
            queryClient.setQueryData(["lectures", data.id], data)
            // Invalidovat cache pro lekce (invaliduje i ["lectures", "group", ...], ["lectures", "client", ...], ["lectures", "day", ...], atd.)
            void queryClient.invalidateQueries({ queryKey: ["lectures"] })
            // Pokud se jedná o skupinovou lekci, invalidovat také cache pro skupiny (kvůli aktualizaci prepaid_cnt)
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
            // Invalidovat cache pro lekce (invaliduje i ["lectures", "group", ...], ["lectures", "client", ...], ["lectures", "day", ...], atd.)
            void queryClient.invalidateQueries({ queryKey: ["lectures"] })
            // Pokud se jednalo o skupinovou lekci, invalidovat také cache pro skupiny (kvůli aktualizaci prepaid_cnt)
            if (data.group) {
                void queryClient.invalidateQueries({ queryKey: ["groups"] })
            }
        },
    })
}
