import { useQuery } from "@tanstack/react-query"

import { AttendanceStateType } from "../../types/models"
import AttendanceStateService from "../services/AttendanceStateService"

/** Hook pro získání všech stavů účasti. */
export function useAttendanceStates() {
    return useQuery<AttendanceStateType[]>({
        queryKey: ["attendanceStates"],
        queryFn: () => AttendanceStateService.getAll(),
    })
}
