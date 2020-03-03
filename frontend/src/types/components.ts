/** Typy pro výměnu dat mezi komponentami. */
export type ModalClientsData =
    | (ModalClientsGroupsData & {
          active: boolean
      })
    | null

export type ModalGroupsData =
    | (ModalClientsGroupsData & {
          active: boolean
      })
    | null

export type ModalClientsGroupsData = {
    isDeleted: boolean
} | null

export type ModalTempData = ModalClientsData | ModalGroupsData
