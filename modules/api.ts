const apiConfig = require('../config/api.json')
import axios from 'axios'

const api = axios.create({
  // baseURL: 'http://10.0.2.5:3333', // this is localhost
  // baseURL: 'http://localhost:3000', // this is localhost
  
  // baseURL: 'http://192.168.0.101/', // this is localhost (multlaszer)
  // baseURL: 'http://10.0.0.13',
  baseURL: apiConfig.baseURL,
  
  // validateStatus: function () { return true; }
  // baseURL: 'http://api.wasitt.com', // this is localhost (telenews)
  // baseURL: 'http://192.168.0.101:3000',
   // this is localhost
  headers: {
    'Access-Control-Allow-Origin': '*',
    Connection: 'keep-alive',
  }
})

export default api
