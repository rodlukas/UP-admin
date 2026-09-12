import { ComboboxItem } from "@mantine/core"
import * as React from "react"

import { useAttendanceStates } from "../api/hooks"
import { useContextWithProvider } from "../hooks/useContextWithProvider"
import { AttendanceStateType } from "../types/models"

type Context = {
    /** Probíhá první načítání dat (true) - data ještě nejsou načtená. */
    isLoading: boolean
    /**
     * Data už někdy dorazila ze serveru — i prázdná. `false` znamená „zatím nenačteno"
     * (první načítání, chyba, offline), takže prázdné pole v takovém případě NENÍ prázdný
     * seznam. Na rozdíl od `status === "success"` přežije selhaný refetch: TanStack Query si při něm
     * data z cache nechá, jen překlopí `status` na „error".
     */
    hasData: boolean
    /** Pole se stavy účastí. */
    attendancestates: AttendanceStateType[]
}

type AttendanceStatesContextInterface = Context | undefined

/** Context pro přístup a práci se stavy účasti. */
const AttendanceStatesContext = React.createContext<AttendanceStatesContextInterface>(undefined)

/** Provider kontextu se stavy účastí. */
export const AttendanceStatesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data, isLoading } = useAttendanceStates()
    // `useMemo`: bez nej je `data ?? []` pri kazdem renderu NOVE pole, takze memoizace
    // u konzumentu (napr. `useVisibleAttendanceStateOptions`) nikdy netrefi a Mantine
    // Select si options i lookup prepocitava dokola
    const attendancestates = React.useMemo(() => data ?? [], [data])

    return (
        <AttendanceStatesContext.Provider
            value={{
                attendancestates,
                isLoading,
                hasData: data !== undefined,
            }}>
            {children}
        </AttendanceStatesContext.Provider>
    )
}

export const useAttendanceStatesContext = (): Context =>
    useContextWithProvider(AttendanceStatesContext)

/**
 * Viditelné stavy účasti jako Select options — sdílené `Settings.tsx` (konfigurace výchozích
 * stavů) i `FormLectures.tsx` (Select stavu účasti u člena). Dřív duplikované v obou místech
 * samostatně, přestože komentáře na sebe navzájem odkazovaly jako na „stejný vzor".
 */
export const useVisibleAttendanceStateOptions = (): ComboboxItem[] => {
    const { attendancestates } = useAttendanceStatesContext()
    return React.useMemo(
        () =>
            attendancestates
                .filter((s) => s.visible)
                .map((s) => ({ value: s.id.toString(), label: s.name })),
        [attendancestates],
    )
}

/**
 * Doplní k viditelným stavům ten aktuálně nastavený, i když je mezitím skrytý.
 *
 * Skrýt stav, který je někde nastavený, nic nezakazuje — bez doplnění by ho Select mezi
 * options nenašel a vykreslil prázdno, takže by tvrdil „nic nenastaveno", přestože hodnota
 * existuje a uživatel by neměl jak zjistit která.
 *
 * `selectable` je jediný rozdíl mezi oběma volajícími a je záměrný:
 * - `Settings.tsx` (konfigurace výchozího/omluveného stavu) ho dává `false` — skrytý stav
 *   nemá jít nastavit a tenhle už nastavený je, takže by jeho vybrání jen poslalo PATCH
 *   beze změny;
 * - `FormLectures.tsx` (stav účasti člena na lekci) `true` — uživatel může omylem přepnout
 *   na jiný stav a musí se mít jak vrátit zpátky.
 *
 * Obojí bylo dřív zvlášť okopírované v obou souborech (a rozešlo se: jeden z nich příznak
 * „(skrytý)" nepřidával), přestože si komentáře navzájem tvrdily „stejný vzor".
 */
export const withCurrentAttendanceState = (
    visibleOptions: ComboboxItem[],
    current: AttendanceStateType | undefined,
    { selectable }: { selectable: boolean },
): ComboboxItem[] =>
    current && !current.visible
        ? [
              ...visibleOptions,
              {
                  value: current.id.toString(),
                  label: `${current.name} (skrytý)`,
                  disabled: !selectable,
              },
          ]
        : visibleOptions

export { AttendanceStatesContext }
