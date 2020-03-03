import * as React from "react"
import { MembershipType } from "../types/models"
import ClientName from "./ClientName"
import ComponentsList from "./ComponentsList"

type Props = {
    memberships: Array<MembershipType>
}

const ClientsList: React.FunctionComponent<Props> = ({ memberships = [] }) => {
    if (!memberships.length) return <span className="text-muted">žádní členové</span>
    const clientComponents = memberships.map(membership => (
        <ClientName client={membership.client} key={membership.client.id} link />
    ))
    return <ComponentsList components={clientComponents} />
}

export default ClientsList
