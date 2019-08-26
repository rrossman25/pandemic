import React from 'react'
import {app, db, config} from '../../firebase-server/firebase'
import {Form, Button} from 'react-bootstrap'
import firebase from 'firebase'

class Chatroom extends React.Component {
  constructor(props) {
    super(props)
    this._isMounted = false
    this.state = {message: '', username: this.props.username, messages: []}
    this.chatroom = db
      .collection('games')
      .doc(this.props.gamename)
      .collection('chatroom')

    this.chatroom.onSnapshot(this.listenMessages)
  }

  componentDidMount() {
    this._isMounted = true
  }

  componentDidUpdate() {
    this.scrollToBottom()
  }

  componentWillUnmount() {
    const unsubscribe = this.chatroom.onSnapshot(this.listenMessages)
    unsubscribe()
    this._isMounted = false
  }

  handleChange = event => {
    this.setState({
      message: event.target.value
    })
  }

  handleSubmit = event => {
    event.preventDefault()
    if (this.state.username && this.state.message) {
      this.chatroom
        .add({
          username: this.props.username,
          message: this.state.message,
          createdAt: firebase.firestore.Timestamp.fromDate(new Date())
        })
        .then(() => {
          if (this._isMounted)
            this.setState({
              message: ''
            })
        })
        .catch(err => {
          console.log('an error has occurred in the chatroom', err.message)
          alert(err.message)
        })
    }
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({behavior: 'smooth'})
  }

  listenMessages = () => {
    let messages = []
    this.chatroom
      .orderBy('createdAt', 'asc')
      .get()
      .then(doc => {
        doc.forEach(function(msg) {
          messages.push(msg.data())
        })
        if (this._isMounted)
          this.setState({
            messages: messages
          })
      })
      .catch(err => {
        console.log('an error has occurred in the chatroom', err.message)
        alert(err.message)
      })
  }

  render() {
    return (
      <React.Fragment>
        <div className="chatBox">
          {this.state.messages.length ? (
            this.state.messages.map((message, index) => (
              <p key={index} className="chatBox-message">
                {message.username} : {message.message}
              </p>
            ))
          ) : (
            <p>No messages</p>
          )}
          <div
            style={{float: 'left', clear: 'both'}}
            ref={el => {
              this.messagesEnd = el
            }}
          />
        </div>
        <Form onSubmit={this.handleSubmit} id="chatroom-submit">
          <Form.Control
            type="text"
            placeholder="enter message here"
            name="message"
            value={this.state.message}
            onChange={this.handleChange}
            id="chatroom-text"
          />
          <Button type="submit" variant="outline-dark">
            Send
          </Button>
        </Form>
      </React.Fragment>
    )
  }
}

export default Chatroom
