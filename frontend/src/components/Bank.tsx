import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faExclamationCircle,
    faExternalLink,
    faInfoCircle,
    faSyncAlt,
} from "@rodlukas/fontawesome-pro-solid-svg-icons"
import classNames from "classnames"
import * as React from "react"
import { ListGroup, ListGroupItem, Table } from "reactstrap"

import { useBank } from "../api/hooks"
import { BANKING_URL } from "../global/constants"
import { isToday, prettyDateWithDayYearIfDiff } from "../global/funcDateTime"
import { prettyAmount } from "../global/utils"
import { BankType, BankSuccessType, BankErrorType } from "../types/models"

import * as styles from "./Bank.css"
import CustomButton from "./buttons/CustomButton"
import NoInfo from "./NoInfo"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

/** Type guard pro úspěšná bankovní data. */
function isBankSuccess(data: BankType | undefined): data is BankSuccessType {
    return !!data && "accountStatement" in data
}

/** Type guard pro chybovou odpověď banky (akceptuje i undefined). */
function isBankError(data: BankType | undefined): data is BankErrorType {
    return !!data && typeof data === "object" && "error_info" in data
}

/** Doba, po kterou nelze ručně provést opakované načtení dat z API. */
const REFRESH_TIMEOUT = 60 // sekundy

type TableInfoProps = {
    /**  Text k zobrazení. */
    text?: string
    /**  Barva textu (bootstrap). */
    color?: string
}

/** Pomocná komponenta pro výpis hlášky místo transakcí v tabulce. */
const TableInfo: React.FC<TableInfoProps> = ({ text, color = "text-muted" }) => (
    <tr className={classNames(color, "text-center")}>
        <td colSpan={4}>{text}</td>
    </tr>
)

/** Komponenta zobrazující přehled transakcí z banky. */
const Bank: React.FC = () => {
    const { data: bankData, isLoading, refetch, isFetching } = useBank()
    /** Manuální obnovení dat je zakázané (true). */
    const [isRefreshDisabled, setIsRefreshDisabled] = React.useState(true)
    const timeoutIdRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    React.useEffect(() => {
        // po zadanem poctu sekund povol tlacitko refresh
        timeoutIdRef.current = globalThis.setTimeout(
            () => setIsRefreshDisabled(false),
            REFRESH_TIMEOUT * 1000,
        )
        return () => {
            if (timeoutIdRef.current !== undefined) {
                globalThis.clearTimeout(timeoutIdRef.current)
            }
        }
    }, [bankData])

    const onClick = React.useCallback((): void => {
        setIsRefreshDisabled(true)
        void refetch()
    }, [refetch])

    const isSuccess = isBankSuccess(bankData)
    const isLackOfMoney =
        isSuccess && bankData.accountStatement.info.closingBalance < bankData.rent_price
    const isLoadingState = isLoading || isFetching

    const getBalanceText = (): React.ReactNode => {
        if (!isSuccess) {
            return isLoadingState ? "načítání" : "neznámý"
        }
        return (
            <span className="fw-bold text-nowrap">
                {prettyAmount(bankData.accountStatement.info.closingBalance)}
            </span>
        )
    }

    const renderTableBody = (data: BankSuccessType): React.ReactNode => {
        if (data.accountStatement.transactionList.transaction.length === 0 && !isLoadingState) {
            return <TableInfo text="Žádné nedávné transakce" />
        }

        return data.accountStatement.transactionList.transaction.map((transaction) => {
            const date = new Date(transaction.column0.value.split("+")[0])
            const amount = transaction.column1.value
            const messageObj = transaction.column16
            const id = transaction.column22.value
            const commentObj = transaction.column25
            const duplicates = messageObj && messageObj.value === commentObj?.value
            const targetAccountOwnerObj = transaction.column10
            return (
                <tr key={id} className={classNames({ "table-warning": isToday(date) })}>
                    <td colSpan={duplicates ? 2 : undefined} data-gdpr data-qa="bank_account_owner">
                        {commentObj?.value ??
                            (targetAccountOwnerObj?.value ? (
                                `Vlastník protiúčtu: ${targetAccountOwnerObj.value}`
                            ) : (
                                <NoInfo />
                            ))}
                    </td>
                    {!duplicates && (
                        <td data-gdpr data-qa="bank_transaction_message">
                            {messageObj ? messageObj.value : <NoInfo />}
                        </td>
                    )}
                    <td className="text-end text-nowrap" style={{ minWidth: "6em" }}>
                        {prettyDateWithDayYearIfDiff(date, true)}
                    </td>
                    <td
                        className={classNames("fw-bold", "text-end", "text-nowrap", {
                            "text-danger": amount < 0,
                        })}
                        style={{ minWidth: "7em" }}>
                        {prettyAmount(amount)}
                    </td>
                </tr>
            )
        })
    }

    const renderMainContent = (): React.ReactNode => {
        if (isBankSuccess(bankData)) {
            return (
                <Table responsive striped borderless>
                    <thead>
                        <tr>
                            <th>Poznámka</th>
                            <th>Zpráva pro příjemce</th>
                            <th className="text-end">Datum</th>
                            <th className="text-end">Suma</th>
                        </tr>
                    </thead>
                    <tbody>{renderTableBody(bankData)}</tbody>
                </Table>
            )
        }
        if (isBankError(bankData)) {
            return <p className="text-danger text-center">{bankData.error_info}</p>
        }
        return null
    }

    return (
        <ListGroup>
            <ListGroupItem
                color={isLackOfMoney ? "danger" : "success"}
                className={classNames("text-center", styles.bankTitle)}>
                <h4
                    className={classNames(
                        "mb-0",
                        "text-nowrap",
                        "d-inline-block",
                        styles.bankTitleText,
                    )}>
                    Aktuální stav: {getBalanceText()}{" "}
                    {isLackOfMoney && (
                        <>
                            <UncontrolledTooltipWrapper target="Bank_RentWarning">
                                Na účtu není dostatek peněz (alespoň{" "}
                                <span className="fw-bold text-nowrap">
                                    {prettyAmount(bankData.rent_price)}
                                </span>
                                ) pro zaplacení nájmu!
                            </UncontrolledTooltipWrapper>
                            <FontAwesomeIcon
                                id="Bank_RentWarning"
                                icon={faExclamationCircle}
                                className="text-danger"
                                size="lg"
                            />
                        </>
                    )}
                </h4>
                <div className="text-muted d-inline float-end" id="Bank">
                    <CustomButton
                        onClick={onClick}
                        disabled={isRefreshDisabled}
                        size="sm"
                        content={
                            <FontAwesomeIcon icon={faSyncAlt} size="lg" spin={isLoadingState} />
                        }
                    />
                    <UncontrolledTooltipWrapper target="Bank">
                        {isRefreshDisabled ? `Výpis lze obnovit jednou za minutu` : "Obnovit výpis"}
                    </UncontrolledTooltipWrapper>{" "}
                </div>
            </ListGroupItem>
            <ListGroupItem>
                {renderMainContent()}
                <div className="text-center text-muted mt-3">
                    <FontAwesomeIcon icon={faInfoCircle} /> Transakce starší než{" "}
                    <strong id="Bank_days">30 dnů</strong> lze zobrazit pouze{" "}
                    <a href={BANKING_URL} target="_blank" rel="noopener noreferrer">
                        v bankovnictví <FontAwesomeIcon icon={faExternalLink} size="xs" />
                    </a>
                    .
                </div>
            </ListGroupItem>
        </ListGroup>
    )
}

export default Bank
