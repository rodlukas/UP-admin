import { useMutation } from "@tanstack/react-query"

import {
    AttendanceStatePatchApi,
    AttendanceStatePostApi,
    AttendanceStatePutApi,
    AttendanceStateType,
} from "../../types/models"
import AttendanceStateService from "../services/AttendanceStateService"

/** Hook pro vytvoření stavu účasti. */
export function useCreateAttendanceState() {
    return useMutation<AttendanceStateType, unknown, AttendanceStatePostApi>({
        mutationFn: (data) => AttendanceStateService.create(data),
    })
}

/** Hook pro aktualizaci stavu účasti. */
export function useUpdateAttendanceState() {
    return useMutation<AttendanceStateType, unknown, AttendanceStatePutApi>({
        mutationFn: (data) => AttendanceStateService.update(data),
    })
}

/** Hook pro částečnou aktualizaci stavu účasti. */
export function usePatchAttendanceState() {
    return useMutation<AttendanceStateType, unknown, AttendanceStatePatchApi>({
        mutationFn: (data) => AttendanceStateService.patch(data),
    })
}

/** Hook pro smazání stavu účasti. */
export function useDeleteAttendanceState() {
    return useMutation<AttendanceStateType, unknown, AttendanceStateType["id"]>({
        mutationFn: (id) => AttendanceStateService.remove(id),
    })
}
