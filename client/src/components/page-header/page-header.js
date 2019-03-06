import React, { Component } from 'react';
import './page-header.css';

export default class PageHeader extends Component {

  users = {
    admin: '8f4c470f-1a52-41ff-a86f-7f5dfa92ce16',
    gmail: 'b3983a70-50f3-4e29-a7e5-4cb4216a6f54',
    seznam: '6f1c97aa-7acc-4056-910d-e5b66f556c6a'
  };

  state = {
    authenticated: false,
    loading: true
  };

  componentDidMount() {

    const { onUserLoad } = this.props;

    fetch('/api/auth/authenticated', {
      method: 'GET',
      mode: 'cors'
    })
      .then(response => {
        const authenticated = response.status === 200;
        this.setState({
          authenticated: authenticated,
          loading: false
        });
        if (authenticated) {
          return response.json();
        }
      })
      .then(data => {
        if (data !== undefined) {
          // noinspection JSUnresolvedVariable
          onUserLoad(data.userInfo, data.users);
        }
      })
      .catch((error) => {
        console.log('Error: ', error);
      });
  }

  authenticate(userId) {
    this.setState({
      loading: true
    });

    fetch('/api/auth/jwt/' + userId)
      .then((response) => {
        const authenticated = response.status === 200;
        this.setState({
          authenticated: authenticated,
          loading: false
        });
        return response.json();
      })
      .then(data => {
        // noinspection JSUnresolvedVariable
        if (data.userInfo === null && data.users === null) {
          // noinspection JSUnresolvedVariable
          window.open(data.jwtUrl, '_blank');
        } else {
          // noinspection JSUnresolvedVariable
          this.props.onUserLoad(data.userInfo, data.users);
        }
      });
  }

  fetchStatus = () => {
    this.setState({ loading: true });
    const { onDocumentStatusLoaded } = this.props;
    fetch('/api/document/status')
      .then((response) => {
        this.setState({ loading: false });
        return response.json();
      })
      .then(data => {
        onDocumentStatusLoaded(data);
      })
      .catch(() => {
        console.log('Could not get status');
      });
  };

  authenticateAdmin = () => {
    return this.authenticate(this.users.admin)
  };

  authenticateGmail = () => {
    return this.authenticate(this.users.gmail)
  };

  authenticateSeznam = () => {
    return this.authenticate(this.users.seznam)
  };

  render() {

    let markup = (
      <div className="fa fa-2x inline">
        <i className="fas fa-sync fa-spin"/>
      </div>
    );
    const { onSignDocument } = this.props;

    if (this.state.loading !== true && !this.state.authenticated) {
      markup = (
        <React.Fragment>
          <button type='button' className='btn btn-primary btn-sm' onClick={ this.authenticateAdmin }>
            Sign as Oleg Infor
          </button>
          <button type='button' className='btn btn-primary btn-sm' onClick={ this.authenticateGmail }>
            Sign as Oleg Gmail
          </button>
          <button type='button' className='btn btn-primary btn-sm' onClick={ this.authenticateSeznam }>
            Sign as Oleg Seznam
          </button>
        </React.Fragment>
      );
    }

    if (this.state.loading !== true && this.state.authenticated) {
      markup = (
        <React.Fragment>
          <button type='button' className='btn btn-primary btn-sm' onClick={ onSignDocument }>
            Sign document
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={ this.fetchStatus }>
            Get status
          </button>
        </React.Fragment>
      );
    }

    return (
      <div className='page-header row'>
        <div className="col-xs-12 col-lg-7">
          <span className='file-name'>Resource file - <strong>demo_document.pdf</strong></span>
        </div>
        <div className="col-xs-12 col-lg-5">
          { markup }
        </div>
      </div>
    );
  }
}
