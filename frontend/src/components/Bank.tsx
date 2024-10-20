import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faExclamationCircle,
    faExternalLink,
    faInfoCircle,
    faSyncAlt,
} from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"
import { ListGroup, ListGroupItem, Table } from "reactstrap"

import BankService from "../api/services/BankService"
import { BANKING_URL, CURRENCY } from "../global/constants"
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

type State = {
    /** Probíhá načítání (true). */
    isLoading: boolean
    /** Manuální obnovení dat je zakázané (true). */
    isRefreshDisabled: boolean
    /** Nastal problém při stahování dat z API (true). */
    isDataProblem: boolean
    /** Data z banky stažená z API. */
    bankDataApi: BankType
}

/** Komponenta zobrazující přehled transakcí z banky. */
export default class Bank extends React.PureComponent<{}, State> {
    bankDataApiInit = {
        accountStatement: {
            info: {
                closingBalance: null,
                dateStart: undefined,
            },
            transactionList: {
                transaction: [],
            },
        },
        fetch_timestamp: null,
        rent_price: null,
        status_info: undefined,
    }

    timeoutId: TimeoutType

    state: State = {
        bankDataApi: this.bankDataApiInit,
        isLoading: true,
        isRefreshDisabled: true,
        isDataProblem: false,
    }

    getBankData = (): void => {
        BankService.getAll().then((response) => {
            if (response.status !== 200) {
                this.setState({
                    // z API dorazi jen status_info, provedeme merge se zbytkem init hodnot
                    bankDataApi: Object.assign(this.bankDataApiInit, response.data),
                    isDataProblem: true,
                    isLoading: false,
                })
            } else {
                this.setState({
                    bankDataApi: response.data,
                    isLoading: false,
                    isRefreshDisabled: true,
                    isDataProblem: false,
                })
            }
            // po zadanem poctu sekund povol tlacitko refresh
            this.timeoutId = window.setTimeout(
                () => this.setState({ isRefreshDisabled: false }),
                REFRESH_TIMEOUT * 1000,
            )
        })
    }

    componentDidMount(): void {
        this.getBankData()
    }

    componentWillUnmount(): void {
        window.clearTimeout(this.timeoutId)
    }

    onClick = (): void => {
        this.setState({ isLoading: true }, this.getBankData)
    }

    render(): React.ReactNode {
        const balance = this.state.bankDataApi.accountStatement.info.closingBalance
        const rentPrice = this.state.bankDataApi.rent_price
        const isLackOfMoney = balance && rentPrice !== null && balance < rentPrice
        return (
            <ListGroup>
                <ListGroupItem color={isLackOfMoney ? "danger" : "success"}>
                    <h4 className="text-center">
                        Aktuální stav:{" "}
                        {balance ? (
                            <span className="fw-bold text-nowrap">
                                {`${prettyAmount(balance)} ${CURRENCY}`}
                            </span>
                        ) : this.state.isDataProblem ? (
                            "neznámý"
                        ) : (
                            "načítání"
                        )}{" "}
                        {isLackOfMoney && rentPrice !== null && (
                            <>
                                <UncontrolledTooltipWrapper target="Bank_RentWarning">
                                    Na účtu není dostatek peněz (alespoň{" "}
                                    <span className="fw-bold text-nowrap">
                                        {`${prettyAmount(rentPrice)} ${CURRENCY}`}
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
                    <div className="text-right">
                        {this.state.bankDataApi.fetch_timestamp && (
                            <span className="font-italic align-middle me-1">
                                Čas výpisu:{" "}
                                {prettyTimeWithSeconds(
                                    new Date(this.state.bankDataApi.fetch_timestamp),
                                )}
                            </span>
                        )}{" "}
                        <CustomButton
                            onClick={this.onClick}
                            disabled={this.state.isRefreshDisabled}
                            id="Bank"
                            content={
                                <FontAwesomeIcon
                                    icon={faSyncAlt}
                                    size="lg"
                                    spin={this.state.isLoading}
                                />
                            }
                        />
                        <UncontrolledTooltipWrapper target="Bank">
                            {this.state.isRefreshDisabled
                                ? "Výpis lze obnovit jednou za minutu"
                                : "Obnovit výpis"}
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
                    <Table responsive striped>
                        <thead>
                            <tr>
                                <th>Poznámka</th>
                                <th>Zpráva pro příjemce</th>
                                <th className="text-right">Datum</th>
                                <th className="text-right">Suma</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!this.state.isDataProblem ? (
                                this.state.bankDataApi.accountStatement.transactionList.transaction
                                    .length === 0 && !this.state.isLoading ? (
                                    <TableInfo text="Žádné nedávné transakce" />
                                ) : (
                                    this.state.bankDataApi.accountStatement.transactionList.transaction.map(
                                        (transaction) => {
                                            const date = new Date(
                                                transaction.column0.value.split("+")[0],
                                            )
                                            const amount = transaction.column1.value
                                            const messageObj = transaction.column16
                                            const id = transaction.column22.value
                                            const commentObj = transaction.column25
                                            const duplicates =
                                                messageObj &&
                                                commentObj &&
                                                messageObj.value === commentObj.value
                                            const targetAccountOwnerObj = transaction.column10
                                            const amountClassName = amount < 0 ? " text-danger" : ""
                                            return (
                                                <tr
                                                    key={id}
                                                    className={
                                                        isToday(date) ? "table-warning" : undefined
                                                    }>
                                                    <td
                                                        colSpan={duplicates ? 2 : undefined}
                                                        data-gdpr>
                                                        {commentObj?.value ? (
                                                            commentObj.value
                                                        ) : targetAccountOwnerObj?.value ? (
                                                            `Vlastník protiúčtu: ${targetAccountOwnerObj.value}`
                                                        ) : (
                                                            <NoInfo />
                                                        )}
                                                    </td>
                                                    {!duplicates && (
                                                        <td data-gdpr>
                                                            {messageObj ? (
                                                                messageObj.value
                                                            ) : (
                                                                <NoInfo />
                                                            )}
                                                        </td>
                                                    )}
                                                    <td
                                                        className="text-right text-nowrap"
                                                        style={{ minWidth: "6em" }}>
                                                        {prettyDateWithDayYearIfDiff(date, true)}
                                                    </td>
                                                    <td
                                                        className={`${amountClassName} fw-bold text-right text-nowrap`}
                                                        style={{ minWidth: "7em" }}>
                                                        {prettyAmount(amount)} {CURRENCY}
                                                    </td>
                                                </tr>
                                            )
                                        },
                                    )
                                )
                            ) : (
                                <TableInfo
                                    text={this.state.bankDataApi.status_info}
                                    color="text-danger"
                                />
                            )}
                        </tbody>
                    </Table>
                    <div className="text-center text-muted font-italic">
                        <FontAwesomeIcon icon={faInfoCircle} /> Transakce starší než{" "}
                        <UncontrolledTooltipWrapper target="Bank_days">
                            {this.state.bankDataApi.accountStatement.info.dateStart
                                ? prettyDateWithDayYearIfDiff(
                                      new Date(
                                          this.state.bankDataApi.accountStatement.info.dateStart.split(
                                              "+",
                                          )[0],
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
}
