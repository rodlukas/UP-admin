import { type QueryKey } from "@tanstack/react-query"

/** Typy `meta`, které čtou globální handlery v `queryClient.tsx`. */
declare module "@tanstack/react-query" {
    // rozšířit rozhraní knihovny (declaration merging) jde jen přes `interface`
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Register {
        queryMeta: {
            /** Chybu dotazu neoznamovat notifikací (komponenta ji ukazuje sama). */
            skipErrorNotification?: boolean
        }
        mutationMeta: {
            /** Text notifikace po úspěšné mutaci (výchozí „Uloženo“). */
            successMessage?: string
            /** Po úspěšné mutaci nezobrazovat žádnou notifikaci. */
            skipSuccessNotification?: boolean
            /** Klíč query záznamu, který mutace maže (z jejích proměnných). */
            // metoda, ne vlastnost: parametry metod jsou bivariantní, takže sem jde předat
            // funkce jako `clientQueryKey` s konkrétním typem proměnných mutace
            deletedQueryKey?(variables: unknown): QueryKey
        }
    }
}
