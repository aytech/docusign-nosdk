import React, { Component } from 'react';
import './page-header.css';
import DocuSignService from "../../services/DocuSignService";

export default class PageHeader extends Component {

  state = {
    authenticated: false,
    loading: false
  };

  docuSignService = new DocuSignService();

  componentWillMount() {
    window.addEventListener('message', (event) => {
      if (event.data === 'authenticated') {
        this.getAuthStatus();
      }
    }, false);
  }

  componentDidMount() {
    this.getAuthStatus();
  }

  authenticateUser = (data) => {
    const { onUserLoad } = this.props;
    const { userInfo, users, templates } = data;
    this.setState({
      authenticated: true,
      loading: false
    });
    onUserLoad(userInfo, users, templates);
  };

  unAuthenticateUser = () => {
    this.setState({
      authenticated: false,
      loading: false
    });
  };

  getAuthStatus = () => {
    this.setState({ loading: true });
    this.docuSignService
      .isUserAuthenticated()
      .then(this.authenticateUser)
      .catch(this.unAuthenticateUser);
  };

  authenticateJwt = () => {
    this.setState({
      loading: true
    });

    this.docuSignService
      .authenticateJWT()
      .then(data => {
        // noinspection JSUnresolvedVariable
        if (data.userInfo === null) {
          // noinspection JSUnresolvedVariable
          window.open(data.jwtUrl, '_blank');
        } else {
          this.authenticateUser(data);
        }
      })
      .catch(this.unAuthenticateUser);
  };

  authenticate = (callback) => {
    this.setState({
      loading: true
    });
    this.docuSignService
      .getAuthenticationCode()
      .then(data => {
        this.setState({ loading: false });
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

  updateDocumentStatus = (data) => {
    const { onDocumentStatusLoaded } = this.props;
    this.setState({ loading: false });
    onDocumentStatusLoaded(data);
  };

  updateDocumentStatusError = (error) => {
    this.setState({ loading: false });
    console.log('Could not get status: ', error);
  };

  fetchStatus = () => {
    this.setState({ loading: true });
    this.docuSignService
      .getDocumentStatus()
      .then(this.updateDocumentStatus)
      .catch(this.updateDocumentStatusError);
  };

  render() {
    let markup = (
      <div className="fa fa-2x inline">
        <i className="fas fa-sync fa-spin"/>
      </div>
    );
    const { onSignDocument, onSenderView } = this.props;

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
          <button type='button' className='btn btn-primary btn-sm' onClick={ onSenderView }>
            Sign with Sender View
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
