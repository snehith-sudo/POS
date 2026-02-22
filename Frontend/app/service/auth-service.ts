import * as  authController  from "../controllers/authController";

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

export async function signupService(
  username: string,
  password: string,
  confirmPassword: string
) {

  // business validations
  if (!username || !password || !confirmPassword)
    throw new Error("Please fill all fields");

  if (password !== confirmPassword)
    throw new Error("Passwords do not match");

  if (password.length < 4)
    throw new Error("Password too short");

  // call controller
  const res = await authController.signup(username.trim(), password);


  if (res.status !== 200 && res.status !== 201)
    throw new Error("Signup failed");

  return res.data ?? { message: "Account created successfully" };
}
export async function logoutUser() {

  await authController.logout();

  // clear frontend session
  sessionStorage.clear();
}


export async function authMe() {

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
