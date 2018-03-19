import {toast} from 'react-toastify'

export const API_URL = "/api/v1/"
export var NOTIFY_LEVEL = {
    DEFAULT: toast.TYPE.DEFAULT,
    SUCCESS: toast.TYPE.SUCCESS,
    ERROR: toast.TYPE.ERROR,
    WARNING: toast.TYPE.WARNING,
    INFO: toast.TYPE.INFO
}
export var NOTIFY_TEXT = {
    SUCCESS: "Úspěšně uloženo",
    ERROR: "Chyba při ukládání",
    ERROR_LOADING: "Došlo k chybě při načítání dat"
}
export var ATTENDANCESTATE_OK = 5
