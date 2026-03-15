import axios from "axios";

const API = axios.create({
  baseURL: "http://10.230.70.247:8082",
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;