import React, { Component } from 'react';
import './App.css';
import axios from 'axios'

class App extends Component {
  constructor(props) {
    super(props);
    this.title = "Klienti";
    this.state = {
        users: []
    }
  }

  getUsers = () => {
    axios.get('/api/v1/clients/')
        .then( (response) => {
            this.setState({users: response.data});
        })
        .catch( (error) => {
            console.log(error);
        });
  }

  componentWillMount() {
    this.getUsers();
  }

  render() {
    console.log(this.state.users);
    return (
        <div>
            <h1>{this.title}</h1>
            <ul>
                {
                    this.state.users.map(
                        user => <li>{user.name} {user.surname} - tel: {user.phone}, e-mail: {user.email}</li>
                    )
                }
            </ul>
        </div>
    );
  }
}

export default App
