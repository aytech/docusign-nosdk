import React, { Component } from 'react';
import './submit-form.css';
import Button from "../button/button";
import Label from "../label/label";

export default class SubmitForm extends Component {
  state = {
    authenticated: false,
    createTemplate: false,
    error: false,
    errorMessage: '',
    loading: false,
    subject: 'DocuSign Infor - Sample Signature Request',
    success: false,
    successMessage: '',
    template: null,
    templateName: '',
    name: '',
    email: '',
    recipients: new Map()
  };

  canSubmit = () => {
    return this.state.recipients.size > 0;
  };

  updateName = (event) => {
    this.setState({ name: event.target.value.trim() });
  };

  updateEmail = (event) => {
    this.setState({ email: event.target.value.trim() });
  };

  addRecipient = (event) => {
    event.preventDefault();
    const { name, email, recipients } = this.state;
    if (name !== '' && email !== '' && !recipients.has(name)) {
      recipients.set(name, email);
      this.setState({ name, email, recipients });
    }
  };

  toggleCreateTemplate = () => {
    this.setState((currentState) => {
      return {
        createTemplate: !currentState.createTemplate
      }
    });
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
    const {
      senderView,
      openSenderView,
      selectedCheckboxes
    } = this.props;
    const {
      subject,
      createTemplate,
      template,
      templateName,
      user: { email, name, id }
    } = this.state;

    fetch('/api/sign', {
      body: JSON.stringify({
        email,
        name,
        subject,
        createTemplate,
        template,
        templateName,
        userId: id,
        documentCount: selectedCheckboxes.size
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

  updateTemplate = (event) => {
    this.setState({
      template: event.target.value
    });
  };

  selectRecipient = (event) => {
    for (const user of this.props.users) {
      if (user.id === event.target.value) {
        const formUser = {
          id: user.id,
          name: `${ user.firstName } ${ user.lastName }`,
          email: user.email
        };
        this.setState({
          user: formUser
        }, this.validateRecipient);
        return;
      }
    }
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

  updateTemplateName = (event) => {
    this.setState({
      templateName: event.target.value
    });
  };

  render() {
    const {
      error,
      errorMessage,
      loading,
      subject,
      success,
      successMessage,
      name,
      email,
      recipients
    } = this.state;
    const userElements = [<option key={ 0 }>Select recipient</option>];
    const templateElements = [<option key={ 0 }>Select template</option>];
    for (const user of this.props.users) {
      userElements.push(
        <option
          key={ user.id }
          value={ user.id }>
          { user.firstName } { user.lastName }
        </option>
      );
    }
    for (const template of this.props.templates) {
      templateElements.push(
        <option
          key={ template.id }
          value={ template.id }>
          { template.name }
        </option>
      );
    }
    for (const recipient in recipients.entries()) {
      recipients.push(`<span class="label label-primary">${ recipient.name }&lt;${ recipient.email }&gt;</span>`);
    }
    return (
      <form onSubmit={ this.submitForm }>
        <div className="form-group">
          <select
            id="template"
            className="form-control"
            onChange={ this.updateTemplate }>
            { templateElements }
          </select>
        </div>
        <div className="checkbox">
          <label>
            <input
              type="checkbox"
              onChange={ this.toggleCreateTemplate }
              value={ this.state.createTemplate }/> Create template
          </label>
        </div>
        <div>
          <div className="form-group">
            <Label
              hidden={ this.state.createTemplate === false }
              for="templateName"
              text="Template name"/>
            <input
              type="text"
              id="templateName"
              className={ this.state.createTemplate === true ? "form-control" : "form-control hidden" }
              value={ this.state.templateName }
              onChange={ this.updateTemplateName }/>
            <div>
              { recipients }
              {/*<span className="label label-primary">Primary</span>*/ }
            </div>
            <Label for="name" text="Recipient name"/>
            <input
              id="name"
              type="text"
              className="form-control"
              value={ name }
              onChange={ this.updateName }/>
            <Label for="email" text="Recipient email"/>
            <input
              id="email"
              type="text"
              className="form-control"
              value={ email }
              onChange={ this.updateEmail }/>
          </div>
          <Button onClick={ this.addRecipient }/>
          <div className="form-group intermediate">
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
          type="primary"
          loading={ loading }
          disabled={
            error === true
            || loading === true
            || !this.canSubmit() }/>
      </form>
    );
  }
}
