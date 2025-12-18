import { useMutation } from "@tanstack/react-query"

import { AttendancePatchApi, AttendanceType } from "../../types/models"
import AttendanceService from "../services/AttendanceService"

type UsePatchAttendanceOptions = {
    /** Zpráva o úspěšném uložení. */
    successMessage: string
}

/** Hook pro částečnou aktualizaci účasti. */
export function usePatchAttendance(options?: UsePatchAttendanceOptions) {
    return useMutation<AttendanceType, unknown, AttendancePatchApi>({
        mutationFn: (data) => AttendanceService.patch(data),
        meta: options
            ? {
                  successMessage: options.successMessage,
              }
            : undefined,
    })
}
