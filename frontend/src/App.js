import React, { Component } from 'react'
import './App.css'
import axios from 'axios'

class App extends Component {
  constructor(props) {
    super(props);
    this.title = "Klienti";
    this.state = {
        users: [],
        attendance: []
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


  getClientLectures = (id) => {
    axios.get('/api/v1/attendances/' + id + '/').then( (response) => {
            this.setState({attendance: response.data});
            console.log(this.state.attendance)
        })
      .catch( (error) => {
            console.log(error);
        });
    this.state.attendance.forEach(function(e){

    })
      /*
    axios.get('/api/v1/clients/', id, '/lectures/')
        .then( (response) => {
            this.setState({users: response.data});
        })
        .catch( (error) => {
            console.log(error);
        });*/
  }

  componentDidMount() {
    this.getUsers();
    this.getClientLectures(1);
  }

  render() {
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
