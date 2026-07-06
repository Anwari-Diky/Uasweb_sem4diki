import { StateManager } from './state.js';

export class API {
  static BASE_URL = 'http://localhost:5000/api';

  static getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    const currentUser = StateManager.get(StateManager.KEYS.CURRENT_USER);
    if (currentUser && currentUser.token) {
      headers['Authorization'] = `Bearer ${currentUser.token}`;
    }
    return headers;
  }

  static async request(endpoint, options = {}) {
    try {
      const url = `${this.BASE_URL}${endpoint}`;
      
      const isFormData = options.body instanceof FormData;
      const headers = this.getHeaders();
      
      if (isFormData) {
        delete headers['Content-Type'];
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  static get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  static post(endpoint, body) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body)
    });
  }

  static put(endpoint, body) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body)
    });
  }

  static delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}
