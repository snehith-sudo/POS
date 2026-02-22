import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
  timeout: 10000,
});

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,

  (error) => {

   
    if (error.response?.status === 403) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("sessionExpiredMessage", "true");
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("lastCheckTime");

        try { window.dispatchEvent(new Event("authChanged")); } catch (e) {}

        if (window.location.pathname !== "/") {
          try { console.warn("Session expired. Redirecting to login."); } catch (e) {}
          window.location.href = "/";
        }
      }
    }

    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    return Promise.reject(new Error(message));
  }
);


export default api;
