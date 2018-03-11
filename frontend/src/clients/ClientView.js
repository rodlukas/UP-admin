import React, {Component} from "react"
import {Table, Button, Modal} from 'reactstrap'
import {Link} from 'react-router-dom'
import axios from "axios"
import FormEditClient from '../forms/FormEditClient'

export default class ClientView extends Component {
    constructor(props) {
        super(props)
        this.clientId = this.props.match.params.clientId
        this.title = "Karta klienta"
        this.state = {
            client: [],
            modal: false,
            currentLecture: [],
            lectures: []
        }
        this.toggle = this.toggle.bind(this)
    }

    toggle(client = []) {
        this.setState({
            currentLecture: client,
            modal: !this.state.modal
        })
    }

    getClient = () => {
        axios.get('/api/v1/clients/' + this.clientId)
            .then((response) => {
                this.setState({client: response.data})
            })
            .catch((error) => {
                console.log(error)
            })
    }

    groupBy(array, f) {
        var groups = {};
        array.forEach(function (o) {
            var group = JSON.stringify(f(o));
            groups[group] = groups[group] || [];
            groups[group].push(o);
        });
        return Object.keys(groups).map(function (group) {
            return groups[group];
        });
    }

    getLectures = () => {
        axios.get('/api/v1/lectures/?client=' + this.clientId)
            .then((response) => {
                let groupedByCourse = response.data.reduce(function (r, a) {
                    r[a.course.id] = r[a.course.id] || [];
                    r[a.course.id].push(a);
                    return r;
                }, Object.create(null));
                let g = this.groupBy(response.data, function (item) {
                    return [item.course];

                })

                var group_to_values = response.data.reduce(function (obj, item) {
                    obj[item.course.name] = obj[item.course.name] || [];
                    obj[item.course.name].push(item);
                    return obj;
                }, {});

                var groups = Object.keys(group_to_values).map(function (key) {
                    return {course: key, values: group_to_values[key]};
                });
                console.log(groups)
                this.setState({lectures: groups})
            })
            .catch((error) => {
                console.log(error)
            })
    }

    componentDidMount() {
        this.getClient()
        this.getLectures()
    }

    render() {
        return (
            <div>
                <h1 className="text-center mb-4">{this.title}: {this.state.client.name} {this.state.client.surname}</h1>
                <Button color="info" onClick={() => this.toggle()}>Přidat klienta</Button>
                <Table>
                    <tbody>
                        <tr>
                        {
                            this.state.lectures.map(
                                lecture =>
                                        <td key={lecture.course.toString()}>
                                            {lecture.course}
                                            <ul>
                                            {
                                                lecture.values.map(
                                                    lectureVal =>
                                                        <li key={'l' + lectureVal.id.toString()}>

                                                            {lectureVal.attendances[0].paid ? 'placeno' : 'NEPLACENO'}<br/>
                                                            {lectureVal.start}<br/>
                                                            {lectureVal.attendances[0].attendancestate.name}
                                                        </li>)
                                            }
                                            </ul>
                                        </td>)
                        }
                        </tr>
                    </tbody>
                </Table>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <FormEditClient client={this.state.currentLecture} funcClose={this.toggle}
                                    funcRefresh={this.getClients}/>
                </Modal>
            </div>
        )
    }
}
