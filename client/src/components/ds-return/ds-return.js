import React, { Component } from 'react';
import DocuSignService from "../../services/DocuSignService";

export default class DsReturn extends Component {

  docuSignService = new DocuSignService();

  componentWillMount() {
    const { location: { search } } = this.props;

    if (search.indexOf('code') !== -1) {
      this.authenticate(search);
    }
  };

  authenticate = (search) => {
    const indexStart = search.indexOf('=') + 1;
    const indexEnd = search.indexOf('&');
    const code = search.substring(indexStart, indexEnd);

    this.docuSignService
      .authenticateUser(code)
      .then(() => {
        if (window.opener === null) {
          window.parent.postMessage('authenticated', '*');
        } else {
          window.opener.postMessage('authenticated', '*');
          window.close();
        }
      });
  };

  render() {
    return (
      <h1>Please close this window.</h1>
    );
  }
}