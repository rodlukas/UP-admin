import React, {Component} from 'react'
import './App.css'
import axios from 'axios'
import LoginControl from './components/LoginControl'

function WarningBanner(props) {
    if (!props.warn) {
        return null
    }

    return (
        <div className="warning">
            Warning!
        </div>
    )
}


{
    user.attendances.map(lecture =>
        <span key={lecture.id.toString()}>
                                {lecture.lecture.course.name} - {lecture.lecture.start}, {lecture.attendancestate.name}
            <br/>
                            </span>)
}

class NameForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {value: ''}

        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(event) {
        this.setState({value: event.target.value})
    }

    handleSubmit(event) {
        alert('A name was submitted: ' + this.state.value)
        event.preventDefault()
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Name:
                    <input type="text" value={this.state.value} onChange={this.handleChange}/>
                </label>
                <input type="submit" value="Submit"/>
            </form>
        )
    }
}


class App extends Component {
    constructor(props) {
        super(props)
        this.title = "Klienti"
        this.state = {
            users: [],
            attendance: [],
            showWarning: true
        }
        this.handleToggleClick = this.handleToggleClick.bind(this)
    }

    handleToggleClick() {
        this.setState(prevState => ({
            showWarning: !prevState.showWarning
        }))
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


    getClientLectures = (id) => {
        axios.get('/api/v1/lectures/' + id + '/').then((response) => {
            this.setState({attendance: response.data})
        })
            .catch((error) => {
                console.log(error)
            })
        this.state.attendance.forEach(function (e) {

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
        this.getUsers()
        this.getClientLectures(1)
    }

    render() {
        return (
            <div>
                <LoginControl/>
                <NameForm/>
                <h1>{this.title}</h1>
                <ul>
                    {
                        this.state.users.map(
                            user => <li key={user.id.toString()}>{user.name} {user.surname} - tel: {user.phone},
                                e-mail: {user.email}, poznamka: {user.note}
                                <br/>terminy:<br/>{user.attendances.map(lecture => <span
                                    key={lecture.id.toString()}>{lecture.lecture.course.name} - {lecture.lecture.start}, {lecture.attendancestate.name}<br/></span>)}
                            </li>
                        )
                    }
                </ul>
                <div>
                    {this.state.users.length > 0 &&
                    <h2>
                        Mate {this.state.users.length} klientu.
                    </h2>
                    }
                </div>

                <div>
                    <br/><b>{this.state.users.length ? 'mate klienty' : 'zadni klienti'}</b>
                </div>
                <div>
                    <WarningBanner warn={this.state.showWarning}/>
                    <button onClick={this.handleToggleClick}>
                        {this.state.showWarning ? 'Hide' : 'Show'}
                    </button>
                </div>
            </div>
        )
    }

}

export default App
