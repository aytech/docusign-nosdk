import React, { Component } from 'react';

export default class PageBody extends Component {

  render() {
    const defaultUser = {
      id: '',
      firstName: '',
      lastName: '',
      email: ''
    };
    let { user } = this.props;

    if (user === undefined || user === null) {
      user = defaultUser;
    }

    return (
      <div className="page-body">
        <div className="row">
          <div className="col-md-12 col-lg-3">
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