import React, { Component } from 'react';
import './page-header.css';

export default class PageHeader extends Component {

  users = {
    admin: '8f4c470f-1a52-41ff-a86f-7f5dfa92ce16'
  };

  state = {
    authenticated: false,
    loading: false
  };

  componentWillMount() {
    const { queryParams: { search } } = this.props;

    if (window.opener === null) {
      window.addEventListener('message', (event) => {
        if (event.data === 'authenticated') {
          this.fetchAuthStatus();
        }
      }, false);
    }

    if (search.indexOf('code') !== -1) {
      const indexStart = search.indexOf('=') + 1;
      const indexEnd = search.indexOf('&');
      const code = search.substring(indexStart, indexEnd);

      fetch('/api/auth/grant/' + code)
        .then((response) => {
          if (response.status === 200) {
            if (window.opener !== null) {
              window.opener.postMessage('authenticated', '*');
            }
            window.close();
          }
        });
    }
  }

  componentDidMount() {
    this.fetchAuthStatus();
  }

  fetchAuthStatus = () => {
    this.setState({ loading: true });
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
        this.setState({ loading: false });
      });
  };

  authenticateJwt() {
    this.setState({
      loading: true
    });

    fetch('/api/auth/jwt/' + this.users.admin)
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

  authenticate = (callback) => {
    this.setState({
      loading: true
    });
    const host = window.location.hostname;
    const port = window.location.port;
    fetch('/api/auth/code/' + encodeURIComponent(host + ':' + port))
      .then((response) => {
        this.setState({ loading: false });
        return response.json();
      })
      .then(data => {
        callback(data);
      });
  };

  authenticateIframe = () => {
    const { onIframeLogin } = this.props;
    this.authenticate(onIframeLogin);
  };

  authenticateTab = () => {
    this.authenticate((url) => {
      window.open(url, 'DocuSign Login', '_blank');
    });
  };

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
          <button type='button' className='btn btn-primary btn-sm' onClick={ this.authenticateJwt }>
            Login (JWT)
          </button>
          <button type='button' className='btn btn-primary btn-sm' onClick={ this.authenticateIframe }>
            Login (Modal)
          </button>
          <button type='button' className='btn btn-primary btn-sm' onClick={ this.authenticateTab }>
            Login
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
