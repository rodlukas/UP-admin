import * as React from "react"

/** Komponenta zobrazující datum a čas sestavení příslušné verze aplikace. */
const AppDate: React.FC = () => <span className="text-nowrap">%GIT_DATETIME</span>

export default AppDate
