/* *************************************************************************************************
Typy pro výměnu dat mezi komponentami.
************************************************************************************************* */

/** Data sdílená komponentou ModalClients s ostatními komponentami, které ji využívají. */
export type ModalClientsData =
    | (ModalClientsGroupsData & {
          active: boolean
      })
    | null

/** Data sdílená komponentou ModalGroups s ostatními komponentami, které ji využívají. */
export type ModalGroupsData =
    | (ModalClientsGroupsData & {
          active: boolean
      })
    | null

/**
 * Data, která jsou sdílena komponentami ModalClients a ModalGroups
 * (jsou součástí dat ModalClientsData a ModalGroupsData).
 */
export type ModalClientsGroupsData = {
    isDeleted: boolean
} | null

/**
 * Všechna možná data, která mohou být sdílena komponentami s modalními okny
 * s ostatními komponentami, které je využívají.
 * Data je třeba dočasně uložit (s tímto typem), při zaslání jednotlivým komponentám
 * si už data komponenty přeberou s upřesněnými typy.
 */
export type ModalTempData = ModalClientsData | ModalGroupsData
