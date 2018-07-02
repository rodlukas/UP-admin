import React, {Fragment} from "react"
import {UncontrolledTooltip} from "reactstrap"
import {Link} from "react-router-dom"
import ClientName from "./ClientName"
import APP_URLS from "../urls"

const ClientsList = ({clients = {}}) =>
    <Fragment>
        {clients.length ?
            clients.map(membership => {
                const client = membership.client
                return (
                    <span key={client.id}>
                        <Link to={APP_URLS.klienti + "/" + client.id} id={"client" + client.id}>
                            <ClientName name={client.name}
                                        surname={client.surname}/>
                        </Link>
                        <UncontrolledTooltip placement="right" target={"client" + client.id}>
                            otevřít kartu
                        </UncontrolledTooltip>
                    </span>)
            }).reduce((accu, elem) => {
                return accu === null ? [elem] : [...accu, ', ', elem]
            }, null)
        :
        <span className="text-muted">
            žádní členové
        </span>}
    </Fragment>


export default ClientsList
