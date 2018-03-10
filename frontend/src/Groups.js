import React, {Component} from "react"
import Select from 'react-select';
import 'react-select/dist/react-select.css'
import axios from "axios"

export default class Groups extends Component {
    constructor(props) {
        super(props)
        this.title = "Skupiny"
        this.state = {
            users: [],
            selectedOption: ''
        }
    }

    handleChange = (selectedOptions) => {
        this.setState({selectedOptions});
        selectedOptions.forEach(selectedOption =>
            console.log(`Selected: ${selectedOption.label}`)
        );
    }

    getUsers = () => {
        axios.get('/api/v1/clients/')
            .then((response) => {
                this.setState({users: response.data})
            })
            .catch((error) => {
                console.log(error)
            })
    }

    componentWillMount() {
        this.getUsers()
    }

    render() {
        let array = []
        this.state.users.map(user => {return array.push({value: user.id, label: user.name + " " + user.surname})})
        return (
            <div>
                <h1 className="text-center mb-4">{this.title}</h1>
                <Select
                    name="form-field-name"
                    closeOnSelect={false}
                    value={this.state.selectedOptions}
                    multi={true}
                    onChange={this.handleChange}
                    options={array}
                    placeholder={"Vyberte členy skupiny..."}
                    noResultsText={"Nic nenalezeno"}
                />
            </div>
        )
    }
}
