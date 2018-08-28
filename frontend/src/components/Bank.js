import React, {Component, Fragment} from "react"
import BankService from "../api/services/bank"
import {ListGroup, ListGroupItem, Table, UncontrolledTooltip} from "reactstrap"
import {prettyDateWithDayYearIfDiff, prettyTimeWithSeconds} from "../global/funcDateTime"
import NoInfo from "./NoInfo"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faSyncAlt, faExternalLinkAlt, faArrowAltUp, faExclamationCircle} from "@fortawesome/pro-solid-svg-icons"
import CustomButton from "./buttons/CustomButton"

const RENT = 3530

export default class Bank extends Component {
    state = {
        bankData: {
            info: {},
            transactions: []
        },
        IS_LOADING: true,
        REFRESH_DISABLED: true
    }

    getBankData = () =>
        BankService.get()
            .then(bankData => {
                this.setState({
                    bankData: {
                        info: bankData.accountStatement.info,
                        transactions: bankData.accountStatement.transactionList.transaction,
                        fetch_timestamp: bankData.fetch_timestamp
                    },
                    IS_LOADING: false,
                    REFRESH_DISABLED: true
                })
                // po 60 s povol tlacitko refresh
                setTimeout(() => this.setState({REFRESH_DISABLED: false}), 60*1000)
            })

    componentDidMount() {
        this.getBankData()
    }

    onClick = () => {
        this.setState({IS_LOADING: true})
        this.getBankData()
    }

    render() {
        const Transactions = () =>
            this.state.bankData.transactions.map(transaction =>
                <tr key={transaction.column22.value}>
                    <td>
                        {transaction.column25 ?
                            transaction.column25.value
                        :
                            transaction.column10 ?
                                "Vlastník protiúčtu: " + transaction.column10.value
                                :
                                <NoInfo/>}
                    </td>
                    <td>
                        {transaction.column16 ?
                            transaction.column16.value
                            :
                            <NoInfo/>}
                    </td>
                    <td>{prettyDateWithDayYearIfDiff(new Date(transaction.column0.value.split("+")[0]))}</td>
                    <td className="font-weight-bold">
                        <FontAwesomeIcon icon={faArrowAltUp}
                                         transform={transaction.column1.value < 0 ? "rotate-45" : "rotate-225"}
                                         className={transaction.column1.value < 0 ? "text-danger" : "text-success"}/>
                        {' '}
                        {transaction.column1.value.toLocaleString()} Kč
                    </td>
                </tr>)

        return (
            <ListGroup>
                <ListGroupItem color={this.state.bankData.info.closingBalance < RENT ? "danger" : "success"}>
                    <h4 className="text-center">
                        Aktuální stav:
                        {' '}
                        {this.state.bankData.info.closingBalance ?
                            <span className="font-weight-bold">
                                {this.state.bankData.info.closingBalance.toLocaleString() + " Kč"}
                            </span>
                            :
                            "načítání"}
                        {' '}
                        {this.state.bankData.info.closingBalance < RENT &&
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
                                      title={this.state.REFRESH_DISABLED ? "Výpis lze obnovit jednou za minutu" : "Obnovit výpis"}
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
                        {!Boolean(this.state.bankData.transactions.length) && !this.state.IS_LOADING ?
                            <tr className="text-muted text-center">
                                <td colSpan="4">Žádné nedávné transakce</td>
                            </tr>
                            :
                            <Transactions/>}
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
