console.log('All env variables:', process.env);  // See all available env vars
console.log('Specific API URL:', process.env.REACT_APP_API_URL);
const API_URL = process.env.REACT_APP_API_URL;
export { API_URL };
