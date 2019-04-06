import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Iframe from 'react-iframe';
import SubmitForm from "../submit-form/submit-form";
import Footer from "../footer/footer";
import Modal from "../modal/modal";
import PageHeader from "../page-header/page-header";
import PageBody from "../page-body/page-body";
import DsReturn from "../ds-return/ds-return";

import './app.css';
import Header from "../navbar/navbar";

class App extends Component {

  state = {
    documentEnvelope: {},
    iframeModalOpen: false,
    iframeUrl: '',
    senderView: false,
    senderViewModalOpen: false,
    senderViewUrl: '',
    signModalOpen: false,
    user: null,
    users: null
  };

  componentWillMount() {
    window.addEventListener('message', (event) => {
      if (event.data === 'authenticated') {
        this.setState({
          iframeModalOpen: false
        })
      }
      console.log('Message received: ', event);
    });
  }

  closeIframeModal = () => {
    this.setState({ iframeModalOpen: false });
  };

  openSignDocumentModal = () => {
    this.setState({ signModalOpen: true });
  };

  closeSignDocumentModal = () => {
    this.setState({ signModalOpen: false });
  };

  closeSenderViewModal = () => {
    this.setState({
      senderViewModalOpen: false
    });
  };

  openSenderView = (url) => {
    this.setState({
      senderViewUrl: url,
      senderViewModalOpen: true
    });
  };

  onDocumentSubmit = () => {
    this.setState({
      senderView: false,
      signModalOpen: false
    });
  };

  onUserLoad = (user, users) => {
    this.setState({ user, users });
  };

  onDocumentStatusLoaded = (documentEnvelope) => {
    this.setState({ documentEnvelope });
  };

  onIframeLogin = (url) => {
    this.setState({
      iframeModalOpen: true,
      iframeUrl: url
    });
  };

  onSenderView = () => {
    this.setState({
      senderView: true,
      signModalOpen: true
    });
  };

  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path='/' render={ (props) => {
            return (
              <React.Fragment>
                <Header/>
                <div className='container main'>
                  <PageHeader
                    onDocumentStatusLoaded={ this.onDocumentStatusLoaded }
                    onIframeLogin={ this.onIframeLogin }
                    onSignDocument={ this.openSignDocumentModal }
                    onSenderView={ this.onSenderView }
                    onUserLoad={ this.onUserLoad }
                    queryParams={ props.location }/>
                  <PageBody
                    documentEnvelope={ this.state.documentEnvelope }
                    user={ this.state.user }/>
                  <Modal
                    header="Sign document"
                    iframe={ false }
                    show={ this.state.signModalOpen === true }
                    onClose={ this.closeSignDocumentModal }>
                    <SubmitForm
                      users={ this.state.users }
                      senderView={ this.state.senderView }
                      onDocumentSubmit={ this.onDocumentSubmit }
                      openSenderView={ this.openSenderView }/>
                  </Modal>
                  <Modal
                    header="Login to DocuSign"
                    show={ this.state.iframeModalOpen === true }
                    iframe={ true }
                    onClose={ this.closeIframeModal }>
                    <Iframe
                      url={ this.state.iframeUrl }
                      position="absolute"
                      width="100%"
                      height="100%"/>
                  </Modal>
                  <Modal
                    header="DocuSign Sender View"
                    show={ this.state.senderViewModalOpen === true }
                    iframe={ true }
                    onClose={ this.closeSenderViewModal }>
                    <Iframe
                      url={ this.state.senderViewUrl }
                      position="absolute"
                      width="100%"
                      height="100%"/>
                  </Modal>
                  <Footer/>
                </div>
              </React.Fragment>
            )
          } } exact={ true }/>
          <Route path='/ds-return' component={ DsReturn }/>
          <Route render={ () => <h2>Page not found!</h2> }/>
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
