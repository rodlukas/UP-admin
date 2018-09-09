import React, {Component, Fragment} from "react"
import BankService from "../api/services/bank"
import {ListGroup, ListGroupItem, Table, UncontrolledTooltip} from "reactstrap"
import {prettyDateWithDayYearIfDiff, prettyTimeWithSeconds, isToday} from "../global/funcDateTime"
import NoInfo from "./NoInfo"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faSyncAlt, faExternalLinkAlt, faArrowAltUp, faExclamationCircle} from "@fortawesome/pro-solid-svg-icons"
import CustomButton from "./buttons/CustomButton"

const RENT = 3530
const REFRESH_TIMEOUT = 60 // sekundy

export default class Bank extends Component {
    bankDataInit = {
        info: {},
        transactions: [],
        fetch_timestamp: ''
    }

    state = {
        bankData: this.bankDataInit,
        IS_LOADING: true,
        REFRESH_DISABLED: true,
        DATA_PROBLEM: false,
        STATUS_CODE: undefined
    }

    getApiError = () =>
    {
        const general_err_msg = "Data se nepodařilo stáhnout"
        let detail_err_msg
        switch (this.state.STATUS_CODE){
            case 404:
                detail_err_msg = "špatně zaslaný dotaz"
                break
            case 409:
                detail_err_msg = "překročení intervalu pro dotazování"
                break
            case 500:
                detail_err_msg = "neexistující/neplatný token"
                break
            default:
                detail_err_msg = "neznámá chyba"
                break
        }
        return general_err_msg + " (" + detail_err_msg + " - chyba " + this.state.STATUS_CODE + ")"
    }

    getBankData = () =>
        BankService.get()
            .then(bankData => {
                if (bankData.status_code)
                    this.setState({
                        bankData: this.bankDataInit,
                        DATA_PROBLEM: true,
                        IS_LOADING: false,
                        STATUS_CODE: bankData.status_code
                    })
                else
                    this.setState({
                        bankData: {
                            info: bankData.accountStatement.info,
                            transactions: bankData.accountStatement.transactionList.transaction,
                            fetch_timestamp: bankData.fetch_timestamp
                        },
                        IS_LOADING: false,
                        REFRESH_DISABLED: true,
                        DATA_PROBLEM: false,
                        STATUS_CODE: undefined
                    })
                // po zadanem poctu sekund povol tlacitko refresh
                this.timeoutId = setTimeout(() => this.setState({REFRESH_DISABLED: false}), REFRESH_TIMEOUT * 1000)
            })

    componentDidMount() {
        this.getBankData()
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId)
    }

    onClick = () => {
        this.setState({IS_LOADING: true})
        this.getBankData()
    }

    render() {
        const TableInfo = ({text}) =>
            <Fragment>
                <tr className="text-muted text-center">
                    <td colSpan="4">{text}</td>
                </tr>
            </Fragment>
        const Transactions = () =>
            this.state.bankData.transactions.map(transaction => {
                const date = new Date(transaction.column0.value.split("+")[0])
                const amount = transaction.column1.value
                const message_obj = transaction.column16
                const id = transaction.column22.value
                const comment_obj = transaction.column25
                const target_account_owner_obj = transaction.column10
                return (
                    <tr key={id} className={isToday(date) ? "table-warning" : undefined}>
                        <td>
                            {comment_obj ?
                                comment_obj.value
                                :
                                target_account_owner_obj ?
                                    "Vlastník protiúčtu: " + target_account_owner_obj.value
                                    :
                                    <NoInfo/>}
                        </td>
                        <td>
                            {message_obj ?
                                message_obj.value
                                :
                                <NoInfo/>}
                        </td>
                        <td>{prettyDateWithDayYearIfDiff(date, true)}</td>
                        <td className="font-weight-bold">
                            <FontAwesomeIcon icon={faArrowAltUp}
                                             transform={amount < 0 ? "rotate-45" : "rotate-225"}
                                             className={amount < 0 ? "text-danger" : "text-success"}/>
                            {' '}
                            {amount.toLocaleString()} Kč
                        </td>
                    </tr>)
            })
        const balance = this.state.bankData.info.closingBalance
        return (
            <ListGroup>
                <ListGroupItem color={balance < RENT ? "danger" : "success"}>
                    <h4 className="text-center">
                        Aktuální stav:
                        {' '}
                        {balance ?
                            <span className="font-weight-bold">
                                {balance.toLocaleString() + " Kč"}
                            </span>
                            :
                            this.state.DATA_PROBLEM ?
                                "neznámý"
                                :
                                "načítání"}
                        {' '}
                        {balance && balance < RENT &&
                        <Fragment>
                            <UncontrolledTooltip placement="bottom" target="tooltip_rent">
                                Na účtu není dostatek peněz pro zaplacení nájmu!
                            </UncontrolledTooltip>
                            <FontAwesomeIcon icon={faExclamationCircle} className="text-danger" size="lg"
                                             id="tooltip_rent"/>
                        </Fragment>}
                    </h4>
                    <div className="text-right">
                        {this.state.bankData.fetch_timestamp &&
                        <span className="font-italic align-middle mr-1">
                            Čas výpisu: {prettyTimeWithSeconds(new Date(this.state.bankData.fetch_timestamp))}
                        </span>}
                        {' '}
                        <CustomButton onClick={this.onClick} disabled={this.state.REFRESH_DISABLED}
                                      title={
                                          this.state.REFRESH_DISABLED ? "Výpis lze obnovit jednou za minutu" : "Obnovit výpis"}
                                      content={
                                          <FontAwesomeIcon icon={faSyncAlt} size="lg" spin={this.state.IS_LOADING}/>}/>
                        {' '}
                        <a href="https://ib.fio.cz/" target="_blank" rel="noopener noreferrer">
                            <CustomButton content={
                                <Fragment>
                                    Bankovnictví <FontAwesomeIcon icon={faExternalLinkAlt} transform="right-2"/>
                                </Fragment>}/>
                        </a>
                    </div>
                </ListGroupItem>
                <ListGroupItem>
                    <Table responsive>
                        <thead>
                        <tr>
                            <th>Poznámka</th>
                            <th>Zpráva pro příjemce</th>
                            <th>Datum</th>
                            <th>Suma</th>
                        </tr>
                        </thead>
                        <tbody>
                        {!this.state.DATA_PROBLEM ?
                            !Boolean(this.state.bankData.transactions.length) && !this.state.IS_LOADING ?
                                <TableInfo text="Žádné nedávné transakce"/>
                                :
                                <Transactions/>
                            :
                            <TableInfo text={this.getApiError()}/>
                        }
                        </tbody>
                    </Table>
                    <div className="text-center text-muted font-italic">
                        Starší položky než 14 dní lze zobrazit pouze v bankovnictví.
                    </div>
                </ListGroupItem>
            </ListGroup>
        )
    }
}
