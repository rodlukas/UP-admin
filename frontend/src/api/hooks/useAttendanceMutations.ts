import { useMutation, useQueryClient } from "@tanstack/react-query"

import { AttendancePatchApi, AttendanceType } from "../../types/models"
import AttendanceService from "../services/AttendanceService"

/** Hook pro částečnou aktualizaci účasti. */
export function usePatchAttendance() {
    const queryClient = useQueryClient()

    return useMutation<AttendanceType, unknown, AttendancePatchApi>({
        mutationFn: (data) => AttendanceService.patch(data),
        onSuccess: () => {
            // Invalidovat lekce, protože účast se může změnit (invaliduje i ["lectures", "group", ...], ["lectures", "client", ...], ["lectures", "day", ...], atd.)
            void queryClient.invalidateQueries({ queryKey: ["lectures"] })
        },
    })
}
