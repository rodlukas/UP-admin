import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faExclamationCircle,
    faExternalLink,
    faInfoCircle,
    faSyncAlt,
} from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"
import { ListGroup, ListGroupItem, Table } from "reactstrap"

import { bankDataApiInit, useBank } from "../api/hooks"
import { BANKING_URL } from "../global/constants"
import { isToday, prettyDateWithDayYearIfDiff, prettyTimeWithSeconds } from "../global/funcDateTime"
import { prettyAmount } from "../global/utils"
import { BankType } from "../types/models"
import { TimeoutType } from "../types/types"

import CustomButton from "./buttons/CustomButton"
import NoInfo from "./NoInfo"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

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
    <tr className={`${color} text-center`}>
        <td colSpan={4}>{text}</td>
    </tr>
)

/** Komponenta zobrazující přehled transakcí z banky. */
const Bank: React.FC = () => {
    const { data: bankDataApiRaw = bankDataApiInit, isLoading, refetch, isFetching } = useBank()
    const bankDataApi: BankType = bankDataApiRaw
    /** Manuální obnovení dat je zakázané (true). */
    const [isRefreshDisabled, setIsRefreshDisabled] = React.useState(true)
    const timeoutIdRef = React.useRef<TimeoutType>(undefined)

    React.useEffect(() => {
        // po zadanem poctu sekund povol tlacitko refresh
        timeoutIdRef.current = window.setTimeout(
            () => setIsRefreshDisabled(false),
            REFRESH_TIMEOUT * 1000,
        ) as TimeoutType
        return () => {
            if (timeoutIdRef.current) {
                window.clearTimeout(timeoutIdRef.current)
            }
        }
    }, [bankDataApi])

    const onClick = React.useCallback((): void => {
        setIsRefreshDisabled(true)
        void refetch()
    }, [refetch])

    const balance = bankDataApi.accountStatement.info.closingBalance
    const rentPrice = bankDataApi.rent_price
    const isLackOfMoney = balance !== null && rentPrice !== null && balance < rentPrice
    const isDataProblem = Boolean(bankDataApi.status_info)
    const isLoadingState = isLoading || isFetching

    const getBalanceText = (): React.ReactNode => {
        if (balance === null) {
            return isDataProblem ? "neznámý" : "načítání"
        }
        return <span className="fw-bold text-nowrap">{prettyAmount(balance)}</span>
    }

    const renderTableBody = (): React.ReactNode => {
        if (isDataProblem) {
            return <TableInfo text={bankDataApi.status_info} color="text-danger" />
        }
        if (
            bankDataApi.accountStatement.transactionList.transaction.length === 0 &&
            !isLoadingState
        ) {
            return <TableInfo text="Žádné nedávné transakce" />
        }
        return bankDataApi.accountStatement.transactionList.transaction.map((transaction) => {
            const date = new Date(transaction.column0.value.split("+")[0])
            const amount = transaction.column1.value
            const messageObj = transaction.column16
            const id = transaction.column22.value
            const commentObj = transaction.column25
            const duplicates = messageObj && messageObj.value === commentObj?.value
            const targetAccountOwnerObj = transaction.column10
            const amountClassName = amount < 0 ? " text-danger" : ""
            return (
                <tr key={id} className={isToday(date) ? "table-warning" : undefined}>
                    <td colSpan={duplicates ? 2 : undefined} data-gdpr>
                        {commentObj?.value ??
                            (targetAccountOwnerObj?.value ? (
                                `Vlastník protiúčtu: ${targetAccountOwnerObj.value}`
                            ) : (
                                <NoInfo />
                            ))}
                    </td>
                    {!duplicates && <td data-gdpr>{messageObj ? messageObj.value : <NoInfo />}</td>}
                    <td className="text-end text-nowrap" style={{ minWidth: "6em" }}>
                        {prettyDateWithDayYearIfDiff(date, true)}
                    </td>
                    <td
                        className={`${amountClassName} fw-bold text-end text-nowrap`}
                        style={{ minWidth: "7em" }}>
                        {prettyAmount(amount)}
                    </td>
                </tr>
            )
        })
    }

    return (
        <ListGroup>
            <ListGroupItem color={isLackOfMoney ? "danger" : "success"}>
                <h4 className="text-center">
                    Aktuální stav: {getBalanceText()}{" "}
                    {isLackOfMoney && rentPrice !== null && (
                        <>
                            <UncontrolledTooltipWrapper target="Bank_RentWarning">
                                Na účtu není dostatek peněz (alespoň{" "}
                                <span className="fw-bold text-nowrap">
                                    {prettyAmount(rentPrice)}
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
                <div className="text-end">
                    {bankDataApi.fetch_timestamp !== null && (
                        <span className="fst-italic align-middle me-1">
                            Čas výpisu:{" "}
                            {prettyTimeWithSeconds(new Date(bankDataApi.fetch_timestamp))}
                        </span>
                    )}{" "}
                    <CustomButton
                        onClick={onClick}
                        disabled={isRefreshDisabled}
                        id="Bank"
                        content={
                            <FontAwesomeIcon icon={faSyncAlt} size="lg" spin={isLoadingState} />
                        }
                    />
                    <UncontrolledTooltipWrapper target="Bank">
                        {isRefreshDisabled ? "Výpis lze obnovit jednou za minutu" : "Obnovit výpis"}
                    </UncontrolledTooltipWrapper>{" "}
                    <a
                        href={BANKING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary">
                        Bankovnictví{" "}
                        <FontAwesomeIcon icon={faExternalLink} transform="right-2" size="sm" />
                    </a>
                </div>
            </ListGroupItem>
            <ListGroupItem>
                <Table responsive striped borderless>
                    <thead>
                        <tr>
                            <th>Poznámka</th>
                            <th>Zpráva pro příjemce</th>
                            <th className="text-end">Datum</th>
                            <th className="text-end">Suma</th>
                        </tr>
                    </thead>
                    <tbody>{renderTableBody()}</tbody>
                </Table>
                <div className="text-center text-muted mt-3">
                    <FontAwesomeIcon icon={faInfoCircle} /> Transakce starší než{" "}
                    <UncontrolledTooltipWrapper target="Bank_days">
                        {bankDataApi.accountStatement.info.dateStart
                            ? prettyDateWithDayYearIfDiff(
                                  new Date(
                                      bankDataApi.accountStatement.info.dateStart.split("+")[0],
                                  ),
                                  true,
                              )
                            : "neznámý datum"}
                    </UncontrolledTooltipWrapper>
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
