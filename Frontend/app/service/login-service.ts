import * as authController from "../controllers/authController";

export async function loginUser(username: string, password: string) {

  if (!username || !password)
    throw new Error("Username and password required");

  const res = await authController.login(username.trim(), password);
  const data = res.data;

  if (!data)
    throw new Error("Login failed");

  // store session info
  sessionStorage.setItem("userId", String(data.userId ?? data.username));
  sessionStorage.setItem("username", data.username);
  sessionStorage.setItem("role", data.role);
  sessionStorage.setItem("lastCheckTime", Date.now().toString());

  return data;
}
export async function signupUser(username: string, password: string, confirm: string) {

  if (!username || !password)
    throw new Error("All fields required");

  if (password !== confirm)
    throw new Error("Passwords do not match");

  const res = await authController.signup(username.trim(), password);
  return res.data;
}
export async function logoutUser() {

  await authController.logout();

  // clear frontend session
  sessionStorage.clear();
}
export async function getCurrentUserService() {

  const res = await authController.getCurrentUser();
  const data = res.data;

  if (!data)
    throw new Error("Not authenticated");

  // restore session storage
  sessionStorage.setItem("userId", String(data.userId));
  sessionStorage.setItem("username", data.username);
  sessionStorage.setItem("role", data.role);
  sessionStorage.setItem("lastCheckTime", Date.now().toString());

  return data;
}
