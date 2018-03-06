import React, { Component } from 'react'
import './App.css'
import ClientsList from './components/ClientsList'
import Menu from './components/Menu'

class App extends Component {
  constructor(props) {
    super(props);
    this.title = "Klienti";
  }

  render() {
    return (
        <div>
            <Menu/>
            <h1>{this.title}</h1>
            <ClientsList/>
        </div>
    );
  }

}

export default App
