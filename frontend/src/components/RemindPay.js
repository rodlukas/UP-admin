import React from 'react'
import {Badge} from 'reactstrap'

const RemindPay = ({remind_pay}) =>
    (remind_pay && <Badge color="warning" pill>Příště platit</Badge>)

export default RemindPay
