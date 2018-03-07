import React from 'react'
import axios from 'axios'

export default class FormEditClient extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            id: props.user.id,
            name: props.user.name,
            surname: props.user.surname,
            email: props.user.email,
            phone: props.user.phone,
            note: props.user.note
        }
    }

    onChange = (e) => {
        const state = this.state
        state[e.target.name] = e.target.value
        this.setState(state)
    }

    onSubmit = (e) => {
        e.preventDefault()
        // get our form data out of state
        const {name, surname, email, phone, note, id} = this.state

        axios.put('/api/v1/clients/' + id + '/', {id, name, surname, email, phone, note})
            .then((response) => {
                this.setState({users: response.data})
            })
            .catch((error) => {
                console.log(error)
            })
    }

    render() {
        const {name, surname, email, phone, note} = this.state
        return (
            <form onSubmit={this.onSubmit}>
                <input type="text" name="name" value={name} onChange={this.onChange}/>
                <input type="text" name="surname" value={surname} onChange={this.onChange}/>
                <input type="text" name="phone" value={phone} onChange={this.onChange}/>
                <input type="text" name="email" value={email} onChange={this.onChange}/>
                <textarea name="note" value={note} onChange={this.onChange}/>
                <button type="submit">Submit</button>
            </form>
        )
    }
}
