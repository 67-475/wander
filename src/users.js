import React from 'react'
import { render } from 'react-dom'
import ListView from './listView'
import Alert from './request/alert'
import Response from './request/response'
import Trip from './request/trip'

export default class Users extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      users: {},
      role: this.props.role,
      view: 'list',
      trip: {}
    }

    this.socket = io('', {query: 'role='+this.props.role +
                                  '&lat='+this.props.position.lat +
                                  '&long='+this.props.position.lng +
                                  '&username='+this.props.username});

    this.socket.on('users', (users) => {
      this.setState({users: users})
    })

    this.socket.on('make request', (data) => {
      this.refs.alert.setState({
        content: data
      })
    })

    this.socket.on('deny trip', (data) => {
      this.refs.response.setState({
        show: true,
        username: data.from,
        status: false
      })
    })

    this.socket.on('start trip', (data) => {
      this.setState({
        view: 'trip',
        trip: {
          tripID: data.tripID,
          users: data.users
        }
      })
    });

    this.socket.on('end trip', (data) => {
      this.setState({
        view: 'list',
        trip: {}
      })
    })

  }

  renderView() {
    if(this.state.view == 'list') {
      const counterparts = { guide: 'tourists', tourist: 'guides' }[this.state.role]

      return (
        <ListView users = { this.state.users[counterparts] }
          role = { counterparts }
          id = { this.socket.id }
          username = { this.props.username } />
      )
    } else if (this.state.view == 'trip') {
      return <Trip users = { this.state.trip.users }
                   tripID = { this.state.trip.tripID } />
    }
  }

  render() {

    return(
      <div className = 'container'>
        <Alert id = { this.socket.id }
               ref = 'alert'
               username = { this.props.username } />
        <Response ref = 'response' />
        { this.renderView() }
      </div>
    )
  }
}
