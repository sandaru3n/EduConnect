//frontend/src/services/api.js
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' // Development
  : ''; // Production

export const API_URL = `${API_BASE}/api/subscriptions`;

// Generic request handler
const handleRequest = async (url, method, body = null) => {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(body && { body: JSON.stringify(body) })
    };

    const response = await fetch(url, options);
    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText || `HTTP error ${response.status}` };
      }
      
      const errorMessage = [
        errorData.message,
        errorData.error?.message,
        `Status: ${response.status}`
      ].filter(Boolean).join(' - ');

      throw new Error(errorMessage);
    }

    return responseText ? JSON.parse(responseText) : null;

  } catch (error) {
    console.error(`API Error (${method} ${url}):`, error.message);
    throw new Error(error.message || 'Request failed. Please try again.');
  }
};

// API functions
export const fetchSubscriptions = () => handleRequest(API_URL, 'GET');

export const createSubscription = (subscription) => 
  handleRequest(API_URL, 'POST', subscription);

export const updateSubscription = (id, subscription) => 
  handleRequest(`${API_URL}/${id}`, 'PUT', subscription);

export const deleteSubscription = (id) => 
  handleRequest(`${API_URL}/${id}`, 'DELETE');