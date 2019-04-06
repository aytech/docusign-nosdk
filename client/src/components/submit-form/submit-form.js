import React, { Component } from 'react';
import './submit-form.css';
import Button from "../button/button";
import Label from "../label/label";

export default class SubmitForm extends Component {

  defaultUser = {
    name: 'Oleg Yapparov',
    email: 'oleg.yapparov@infor.com'
  };
  state = {
    authenticated: false,
    error: false,
    errorMessage: '',
    loading: false,
    subject: 'DocuSign Infor - Sample Signature Request',
    success: false,
    successMessage: '',
    user: this.defaultUser
  };

  submitForm = (event) => {
    event.preventDefault();
    this.validateRecipient(this.signDocument);
  };

  validateRecipient = (callback) => {
    const { user } = this.state;
    if (user.name === '' || user.email === '') {
      this.setState({
        error: true,
        errorMessage: 'Please add or select recipient'
      });
    } else {
      this.setState({
        error: false,
        errorMessage: ''
      }, callback);
    }
  };

  signDocument = () => {
    this.setState({ loading: true });
    const { subject, user: { email, name } } = this.state;
    const { senderView, openSenderView } = this.props;

    fetch('/api/sign', {
      body: JSON.stringify({
        email,
        name,
        subject
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      mode: 'cors'
    })
      .then(response => {
        let {
          error,
          errorMessage,
          success,
          successMessage
        } = this.state;
        if (response.status === 200) {
          success = true;
          successMessage = 'Document submitted successfully';
        } else {
          error = true;
          errorMessage = response.statusText;
        }
        this.setState({
          error,
          errorMessage,
          success,
          successMessage,
          loading: false
        });
        return response.json();
      })
      .then((data) => {
        if (senderView === true) {
          openSenderView(data.senderViewUrl);
        }
      });
  };

  updateSubject = (event) => {
    this.setState({
      subject: event.target.value
    });
  };

  selectRecipient = (event) => {
    let formUser = this.defaultUser;
    for (const user of this.props.users) {
      if (user.id === event.target.value) {
        formUser = {
          name: `${ user.firstName } ${ user.lastName }`,
          email: user.email
        }
      }
    }
    this.setState({
      user: formUser
    }, this.validateRecipient);
  };

  updateRecipientName = (event) => {
    const name = event.target.value;
    this.setState(({ user }) => {
      return {
        user: {
          name: name,
          email: user.email
        }
      };
    }, this.validateRecipient);
  };

  updateRecipientEmail = (event) => {
    const email = event.target.value;
    this.setState(({ user }) => {
      return {
        user: {
          name: user.name,
          email: email
        }
      };
    }, this.validateRecipient);
  };

  render() {
    const {
      error,
      errorMessage,
      loading,
      subject,
      success,
      successMessage
    } = this.state;
    const userElements = [<option key={ 0 }>Select recipient</option>];
    for (const user of this.props.users) {
      userElements.push(
        <option
          key={ user.id }
          value={ user.id }>
          { user.firstName } { user.lastName }
        </option>
      );
    }
    return (
      <form onSubmit={ this.submitForm }>
        <div className="form-group">
          <Label for="name" text="Recipient name"/>
          <input
            id="name"
            type="text"
            className="form-control"
            value={ this.state.user.name }
            onChange={ this.updateRecipientName }/>
          <Label for="email" text="Recipient email"/>
          <input
            id="email"
            type="text"
            className="form-control"
            value={ this.state.user.email }
            onChange={ this.updateRecipientEmail }/>
        </div>
        <div className="form-group">
          <Label for="recipient" text="Or select recipient"/>
          <select
            id="recipient"
            className="form-control"
            onChange={ this.selectRecipient }>
            { userElements }
          </select>
        </div>
        <div className="form-group">
          <Label for="subject" text="Subject"/>
          <textarea
            className="form-control"
            rows="3"
            id="subject"
            placeholder="Subject"
            value={ subject }
            onChange={ this.updateSubject }/>
        </div>
        { error === true &&
        <div
          className="alert alert-danger"
          role="alert">
          { errorMessage }
        </div>
        }
        { success === true &&
        <div
          className="alert alert-success"
          role="alert">
          { successMessage }
        </div>
        }
        <Button
          loading={ loading }
          disabled={ error === true || loading === true }/>
      </form>
    );
  }
}
