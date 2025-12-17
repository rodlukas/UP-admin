import { useMutation } from "@tanstack/react-query"

import { AttendancePatchApi, AttendanceType } from "../../types/models"
import AttendanceService from "../services/AttendanceService"

/** Hook pro částečnou aktualizaci účasti. */
export function usePatchAttendance() {
    return useMutation<AttendanceType, unknown, AttendancePatchApi>({
        mutationFn: (data) => AttendanceService.patch(data),
    })
}
