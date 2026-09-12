import * as React from "react"

import { nowrap } from "../global/utility.css"

/** Komponenta zobrazující datum a čas sestavení příslušné verze aplikace. */
const AppDate: React.FC = () => <span className={nowrap}>%GIT_DATETIME</span>

export default AppDate
