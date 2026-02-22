import api from "../interceptor/axios";
/* login */
export const login = (username: string, password: string) =>
  api.post("/auth/login", { username, password });

/* signup */
export const signup = (username: string, password: string) =>
  api.post("/auth/signup", { username, password });

/* logout */
export const logout = () =>
  api.post("/auth/logout");

/* get current user */
export const getCurrentUser = () =>
  api.get("/auth/me");

