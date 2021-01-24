// This function will set token to global header
import axios from 'axios';

const setAuthToken = (token) => {
  if (token) {
    //   Assigning to global below line 7 key 'x-auth-token'
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

export default setAuthToken;
