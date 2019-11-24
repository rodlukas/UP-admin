export function parseDjangoError(error) {
    if (!error.request) return null
    error = error.request.response
    try {
        // rozparsuj JSON objekt
        let json = JSON.parse(error)
        // pokud se pridava (neupdatuje) a chyba se vztahuje ke konkretnimu field
        // (napr. pridavani vice preplacenych lekci jednotlivci), vraci se pole,
        // vsechny prvky jsou stejne, vezmi z nej tedy prvni prvek s info o chybe
        if (Array.isArray(json)) json = json[0]
        // obecna chyba nevztazena ke konkretnimu field,
        // nebo chyba muze obsahovat detailni informace (napr. metoda PUT neni povolena)
        if ("non_field_errors" in json || "detail" in json) {
            error = json["non_field_errors"] || json["detail"]
            // stringify, kdyz prijde objekt
            if (Array.isArray(error) && error.length !== 1) error = JSON.stringify(error)
            if (Array.isArray(error) && error.length === 1) error = error[0]
        }
        // chyba vztazena ke konkretnimu field
        else if (json[Object.keys(json)[0]]) {
            Object.keys(json).map(field => {
                json[field] = Array.isArray(json[field])
                    ? json[field]
                          .map(subField => {
                              let errContent
                              if (typeof subField === "object")
                                  errContent =
                                      Object.keys(subField)[0] +
                                      ": " +
                                      subField[Object.keys(subField)[0]]
                              else if (typeof subField === "string") errContent = subField
                              else errContent = JSON.stringify(subField)
                              return errContent
                          })
                          .join(", ")
                    : json[field]
            })
            error = json
        }
    } catch (error) {
        return null
    }
    return error
}
