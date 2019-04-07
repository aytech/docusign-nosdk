export default class DocuSignService {

  apiBase = '/api';
  jwtUserId = '8f4c470f-1a52-41ff-a86f-7f5dfa92ce16';

  async getResource(url, headers) {
    const resource = await fetch(`${ this.apiBase }${ url }`, headers);
    if (!resource.ok) {
      throw new Error(`Could not fetch ${ url }, status: ${ resource.status }`);
    }
    return await resource.json();
  }

  authenticateUser = async (authCode) => {
    return await this.getResource(`/auth/grant/${ authCode }`);
  };

  authenticateJWT = async () => {
    return await this.getResource(`/auth/jwt/${ this.jwtUserId }`);
  };

  getAuthenticationCode = async () => {
    return await this.getResource('/auth/code');
  };

  getDocumentStatus = async () => {
    return await this.getResource('/document/status');
  };

  isUserAuthenticated = async () => {
    const headers = { method: 'GET', mode: 'cors' };
    return await this.getResource('/auth/authenticated', headers);
  }
}