/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { AxiosError } from "axios"

/** Rozparsuje pro frontend chybu vrácenou z API. */
export function parseDjangoError(error: AxiosError): null | { [key: string]: any } | string {
    if (!error.request) {
        return null
    }
    let result = error.request.response
    try {
        // rozparsuj JSON objekt
        let json = JSON.parse(result)
        // pokud se pridava (neupdatuje) a chyba se vztahuje ke konkretnimu field
        // (napr. pridavani vice preplacenych lekci jednotlivci), vraci se pole,
        // vsechny prvky jsou stejne, vezmi z nej tedy prvni prvek s info o chybe
        if (Array.isArray(json)) {
            json = json[0]
        }
        // obecna chyba nevztazena ke konkretnimu field,
        // nebo chyba muze obsahovat detailni informace (napr. metoda PUT neni povolena)
        if ("non_field_errors" in json || "detail" in json) {
            result = json["non_field_errors"] || json["detail"]
            // stringify, kdyz prijde objekt
            if (Array.isArray(result) && result.length !== 1) {
                result = JSON.stringify(result)
            }
            if (Array.isArray(result) && result.length === 1) {
                result = result[0]
            }
        }
        // chyba vztazena ke konkretnimu field
        else if (json[Object.keys(json)[0]]) {
            Object.keys(json).forEach((field) => {
                json[field] = Array.isArray(json[field])
                    ? json[field]
                          .map((subField: { [key: string]: any } | string | []) => {
                              let errContent
                              if (typeof subField === "object" && !Array.isArray(subField)) {
                                  errContent = `${Object.keys(subField)[0]}: ${
                                      subField[Object.keys(subField)[0]]
                                  }`
                              } else if (typeof subField === "string") {
                                  errContent = subField
                              } else if (Array.isArray(subField)) {
                                  errContent = JSON.stringify(subField)
                              }
                              return errContent
                          })
                          .join(", ")
                    : json[field]
            })
            result = json
        }
    } catch {
        return null
    }
    return result
}
