import { useQuery } from "@tanstack/react-query"

import { ClientType, GroupType, LectureType, LectureTypeWithDate } from "../../types/models"
import LectureService from "../services/LectureService"

/** Hook pro získání všech lekcí. */
export function useLectures() {
    return useQuery<LectureType[]>({
        queryKey: ["lectures"],
        queryFn: () => LectureService.getAll(),
    })
}

/** Hook pro získání jedné lekce. */
export function useLecture(id: LectureType["id"] | undefined) {
    return useQuery<LectureType>({
        queryKey: ["lectures", id],
        queryFn: () => {
            if (!id) {
                throw new Error("Lecture ID is required")
            }
            return LectureService.get(id)
        },
        enabled: !!id,
    })
}

/** Hook pro získání lekcí dané skupiny. */
export function useLecturesFromGroup(groupId: GroupType["id"] | undefined, asc = true) {
    return useQuery<LectureType[]>({
        queryKey: ["lectures", { group: groupId, asc }],
        queryFn: () => {
            if (!groupId) {
                throw new Error("Group ID is required")
            }
            return LectureService.getAllFromGroupOrdered(groupId, asc)
        },
        enabled: !!groupId,
    })
}

/** Hook pro získání lekcí daného klienta. */
export function useLecturesFromClient(clientId: ClientType["id"] | undefined, asc = true) {
    return useQuery<LectureType[]>({
        queryKey: ["lectures", { client: clientId, asc }],
        queryFn: () => {
            if (!clientId) {
                throw new Error("Client ID is required")
            }
            return LectureService.getAllFromClientOrdered(clientId, asc)
        },
        enabled: !!clientId,
    })
}

/** Hook pro získání lekcí v daném dni. */
export function useLecturesFromDay(date: string | undefined, asc = true) {
    return useQuery<LectureTypeWithDate[]>({
        queryKey: ["lectures", { day: date, asc }],
        queryFn: () => {
            if (!date) {
                throw new Error("Date is required")
            }
            return LectureService.getAllFromDayOrdered(date, asc)
        },
        enabled: !!date,
    })
}
