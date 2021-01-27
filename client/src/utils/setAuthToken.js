// This function will set token to global header
import axios from 'axios';
// @@   Now setAuthToken set incoming token to global header
// and set the token in localStorage instead of authReducer
const setAuthToken = (token) => {
  if (token) {
    //   Assigning to global below line 7 key 'x-auth-token'
    axios.defaults.headers.common['x-auth-token'] = token;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
    localStorage.removeItem('token');
  }
};

export default setAuthToken;
