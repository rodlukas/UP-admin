import React from 'react'
import {UncontrolledTooltip} from 'reactstrap'
import {Link} from 'react-router-dom'
import ClientName from "./ClientName"

const ClientsList = ({clients = {}}) => {
    return (
        <span>
            {clients.length ?
                clients.map(membership =>
                    <span key={membership.client.id}>
                        <Link to={"/klienti/" + membership.client.id} id={"client" + membership.client.id}>
                            <ClientName name={membership.client.name}
                                        surname={membership.client.surname}/>
                        </Link>
                        <UncontrolledTooltip placement="right" target={"client" + membership.client.id}>
                            otevřít kartu
                        </UncontrolledTooltip>
                    </span>).reduce((accu, elem) => {
                    return accu === null ? [elem] : [...accu, ', ', elem]
                }, null)
                :
                <span className="text-muted">žádní členové</span>}
        </span>)
}

export default ClientsList
