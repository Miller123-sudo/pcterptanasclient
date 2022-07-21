import axios from "axios";
import constants from "./Constants";
import { TokenService } from "./StorageServices";

const ApiService = {
  init(baseURL) {
    // axios.defaults.baseURL = `http://192.168.2.6:2022/api/v1/`;
    //axios.defaults.baseURL = `http://13.68.137.56:86/api/v1/`;
    axios.defaults.baseURL = `https://pcterp-tanas-customapp.herokuapp.com/api/v1/`;
  },

  setHeader() {
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${TokenService.getToken()}`;
    //axios.defaults.headers.common["Authorization"] = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwYzMxZTBjNmMyODdkZTUxNDU4NDg1YSIsImlhdCI6MTYyNDAyMjgyMSwiZXhwIjoxNjMxNzk4ODIxfQ.CiLWqw5mEnWxTEwbhWrd1e7NyW075yEu9FvucbILs0w`
  },

  removeHeader() {
    axios.defaults.headers.common = {};
  },

  get(resource) {
    return axios.get(resource);
  },

  post(resource, data) {
    return axios.post(resource, data);
  },

  patch(resource, data) {
    return axios.patch(resource, data);
  },

  delete(resource) {
    return axios.delete(resource);
  },

  /**
   * Perform a custom Axios request.
   *
   * data is an object containing the following properties:
   *  - method
   *  - url
   *  - data ... request payload
   *  - auth (optional)
   *    - username
   *    - password
   **/
  customRequest(data) {
    return axios(data);
  },
};

export default ApiService;
