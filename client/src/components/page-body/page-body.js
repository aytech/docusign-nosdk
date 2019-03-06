import React, { Component } from 'react';

export default class PageBody extends Component {

  render() {
    const defaultUser = {
      id: '',
      firstName: '',
      lastName: '',
      email: ''
    };
    const defaultDocumentStatus = {
      envelopeId: '',
      createdDateTime: '',
      status: ''
    };
    let { user, documentStatus } = this.props;

    if (user === undefined || user === null) {
      user = defaultUser;
    }
    if (documentStatus === undefined || documentStatus === null) {
      documentStatus = defaultDocumentStatus;
    }

    return (
      <div className="page-body">
        <div className="row">
          <div className="col-md-12 col-lg-4">
            <div className="table-responsive">
              <table className="table">
                <caption>Authenticated as:</caption>
                <tbody>
                <tr>
                  <th scope="row">Name:</th>
                  <td>
                    { user.firstName }&nbsp;
                    { user.lastName }
                  </td>
                </tr>
                <tr>
                  <th scope="row">Email:</th>
                  <td>{ user.email }</td>
                </tr>
                <tr>
                  <th scope="row">ID:</th>
                  <td>{ user.id }</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-md-12 col-lg-4">
            <div className="table-responsive">
              <table className="table">
                <caption>Document status:</caption>
                <tbody>
                <tr>
                  <th scope="row">ID:</th>
                  <td>{ documentStatus.envelopeId }</td>
                </tr>
                <tr>
                  <th scope="row">Created:</th>
                  <td>{ documentStatus.createdDateTime }</td>
                </tr>
                <tr>
                  <th scope="row">Status:</th>
                  <td>{ documentStatus.status }</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-md-12 col-lg-9">
            <embed
              src={ '/demo_document.pdf' }
              width='800'
              height='1100px'/>
          </div>
        </div>
      </div>
    );
  }
}