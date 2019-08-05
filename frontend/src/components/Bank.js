import {faExclamationCircle, faExternalLinkAlt, faInfoCircle, faSyncAlt} from "@fortawesome/pro-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import React, {Fragment} from "react"
import {ListGroup, ListGroupItem, Table, UncontrolledTooltip} from "reactstrap"
import BankService from "../api/services/bank"
import {RENT_PRICE} from "../global/constants"
import {isToday, prettyDateWithDayYearIfDiff, prettyTimeWithSeconds} from "../global/funcDateTime"
import {prettyAmount} from "../global/utils"
import CustomButton from "./buttons/CustomButton"
import NoInfo from "./NoInfo"

const REFRESH_TIMEOUT = 60 // sekundy

const TableInfo = ({text, color = "text-muted"}) =>
    <tr className={color + " text-center"}>
        <td colSpan="4">{text}</td>
    </tr>

export default class Bank extends React.PureComponent {
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
        STATUS_INFO: undefined
    }

    getBankData = () =>
        BankService.get()
            .then(response => {
                if (response.status !== 200)
                    this.setState({
                        bankData: this.bankDataInit,
                        DATA_PROBLEM: true,
                        IS_LOADING: false,
                        STATUS_INFO: response.data.status_info
                    })
                else
                    this.setState({
                        bankData: {
                            info: response.data.accountStatement.info,
                            transactions: response.data.accountStatement.transactionList.transaction,
                            fetch_timestamp: response.data.fetch_timestamp
                        },
                        IS_LOADING: false,
                        REFRESH_DISABLED: true,
                        DATA_PROBLEM: false,
                        STATUS_INFO: undefined
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
        this.setState({IS_LOADING: true}, this.getBankData)
    }

    render() {
        const balance = this.state.bankData.info.closingBalance
        return (
            <ListGroup className="pageContent">
                <ListGroupItem color={balance < RENT_PRICE ? "danger" : "success"}>
                    <h4 className="text-center">
                        Aktuální stav:
                        {' '}
                        {balance ?
                            <span className="font-weight-bold">
                                {prettyAmount(balance) + " Kč"}
                            </span>
                            :
                            this.state.DATA_PROBLEM ?
                                "neznámý"
                                :
                                "načítání"}
                        {' '}
                        {balance && balance < RENT_PRICE &&
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
                        {!this.state.DATA_PROBLEM ?
                            !Boolean(this.state.bankData.transactions.length) && !this.state.IS_LOADING ?
                                <TableInfo text="Žádné nedávné transakce"/>
                                :
                                this.state.bankData.transactions.map(transaction => {
                                    console.log("...")
                                    const date = new Date(transaction.column0.value.split("+")[0])
                                    const amount = transaction.column1.value
                                    const message_obj = transaction.column16
                                    const id = transaction.column22.value
                                    const comment_obj = transaction.column25
                                    const duplicates = message_obj && comment_obj && message_obj.value === comment_obj.value
                                    const target_account_owner_obj = transaction.column10
                                    const amount_className = "font-weight-bold text-right" + (amount < 0 ? " text-danger" : "")
                                    return (
                                        <tr key={id} className={isToday(date) ? "table-warning" : undefined}>
                                            <td colSpan={duplicates && 2}>
                                                {comment_obj ?
                                                    comment_obj.value
                                                    :
                                                    target_account_owner_obj ?
                                                        "Vlastník protiúčtu: " + target_account_owner_obj.value
                                                        :
                                                        <NoInfo/>}
                                            </td>
                                            {!duplicates &&
                                            <td>
                                                {message_obj ?
                                                    message_obj.value
                                                    :
                                                    <NoInfo/>}
                                            </td>}
                                            <td className="text-right"
                                                style={{minWidth: '6em'}}>{prettyDateWithDayYearIfDiff(date, true)}</td>
                                            <td className={amount_className} style={{minWidth: '7em'}}>
                                                {prettyAmount(amount)} Kč
                                            </td>
                                        </tr>)
                                })
                            :
                            <TableInfo text={this.state.STATUS_INFO} color="text-danger"/>
                        }
                        </tbody>
                    </Table>
                    <div className="text-center text-muted font-italic">
                        <FontAwesomeIcon icon={faInfoCircle}/>
                        {' '}
                        Transakce starší 14 dnů lze zobrazit pouze v bankovnictví
                    </div>
                </ListGroupItem>
            </ListGroup>
        )
    }
}
