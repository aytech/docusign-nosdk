import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import SubmitForm from "../submit-form/submit-form";
import Footer from "../footer/footer";
import Modal from "../modal/modal";
import PageHeader from "../page-header/page-header";
import PageBody from "../page-body/page-body";

import './app.css';

class App extends Component {

  state = {
    documentStatus: null,
    signModalOpen: false,
    user: null,
    users: null
  };

  openSignDocumentModal = () => {
    this.setState({
      signModalOpen: true
    });
  };

  closeSignDocumentModal = () => {
    this.setState({
      signModalOpen: false
    });
  };

  onDocumentSubmit = () => {
    this.setState({
      signModalOpen: false,
    });
  };

  onUserLoad = (user, users) => {
    this.setState({
      user, users
    });
  };

  onDocumentStatusLoaded = (documentStatus) => {
    this.setState({ documentStatus });
  };

  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path='/' render={ (props) => {
            return (
              <div className='container main'>
                <PageHeader
                  onDocumentStatusLoaded={ this.onDocumentStatusLoaded }
                  onSignDocument={ this.openSignDocumentModal }
                  onUserLoad={ this.onUserLoad }
                  queryParams={ props.location }/>
                <PageBody
                  documentStatus={ this.state.documentStatus }
                  user={ this.state.user }/>
                <Modal
                  header="Sign document"
                  show={ this.state.signModalOpen === true }
                  onClose={ this.closeSignDocumentModal }>
                  <SubmitForm
                    users={ this.state.users }
                    onDocumentSubmit={ this.onDocumentSubmit }/>
                </Modal>
                <Footer/>
              </div>
            )
          } } exact={ true }/>
          <Route render={ () => <h2>Page not found!</h2> }/>
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
