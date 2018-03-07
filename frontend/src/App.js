import React, {Component} from 'react'
import './App.css'
import ClientsList from './components/ClientsList'
import Menu from './components/Menu'

class App extends Component {
    render() {
        return (
            <div>
                <Menu/>
                <ClientsList/>
            </div>
        )
    }
}

export default App
