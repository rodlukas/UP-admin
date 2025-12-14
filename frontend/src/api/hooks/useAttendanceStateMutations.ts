import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
    AttendanceStatePatchApi,
    AttendanceStatePostApi,
    AttendanceStatePutApi,
    AttendanceStateType,
} from "../../types/models"
import AttendanceStateService from "../services/AttendanceStateService"

/** Hook pro vytvoření stavu účasti. */
export function useCreateAttendanceState() {
    const queryClient = useQueryClient()

    return useMutation<AttendanceStateType, unknown, AttendanceStatePostApi>({
        mutationFn: (data) => AttendanceStateService.create(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["attendanceStates"] })
        },
    })
}

/** Hook pro aktualizaci stavu účasti. */
export function useUpdateAttendanceState() {
    const queryClient = useQueryClient()

    return useMutation<AttendanceStateType, unknown, AttendanceStatePutApi>({
        mutationFn: (data) => AttendanceStateService.update(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["attendanceStates"] })
        },
    })
}

/** Hook pro částečnou aktualizaci stavu účasti. */
export function usePatchAttendanceState() {
    const queryClient = useQueryClient()

    return useMutation<AttendanceStateType, unknown, AttendanceStatePatchApi>({
        mutationFn: (data) => AttendanceStateService.patch(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["attendanceStates"] })
        },
    })
}

/** Hook pro smazání stavu účasti. */
export function useDeleteAttendanceState() {
    const queryClient = useQueryClient()

    return useMutation<AttendanceStateType, unknown, AttendanceStateType["id"]>({
        mutationFn: (id) => AttendanceStateService.remove(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["attendanceStates"] })
        },
    })
}
