import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://okhlryfle2.execute-api.us-east-2.amazonaws.com/dev",
  timeout: 5000,
});

export default axiosInstance;
