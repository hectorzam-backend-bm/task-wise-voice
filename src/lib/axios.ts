import Axios, { InternalAxiosRequestConfig } from "axios";
import { getAccessToken } from "./tokens";

export const axiosPublic = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

const axiosAuth = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

const authRequestInterceptor = (config: InternalAxiosRequestConfig) => {
  if (config.headers) {
    const token = getAccessToken();
    console.log("Auth interceptor - Token:", token ? "Present" : "Missing");
    if (token) {
      config.headers["authorization"] = `Bearer ${token}`;
      console.log("Auth interceptor - Authorization header set");
    } else {
      console.warn("Auth interceptor - No token found in localStorage");
    }
  }
  return config;
};

axiosAuth.interceptors.request.use(authRequestInterceptor);

export { axiosAuth };
