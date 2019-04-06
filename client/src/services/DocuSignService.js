export default class DocuSignService {

  apiBase = '/api';

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

  getAuthenticationCode = async () => {
    return await this.getResource('/auth/code');
  };

  isUserAuthenticated = async () => {
    const headers = { method: 'GET', mode: 'cors' };
    return await this.getResource('/auth/authenticated', headers);
  }
}