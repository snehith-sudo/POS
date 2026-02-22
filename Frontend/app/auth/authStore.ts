import { authMe } from "../service/auth-service";

const AUTH_CHECK_INTERVAL = 5 * 60 * 1000;

type State = {
  isAuthValid: boolean;
  isChecking: boolean;
  lastCheckTime?: number;
};

let state: State = { isAuthValid: false, isChecking: true };
let subscribers: Array<(s: State) => void> = [];
let initialized = false;
let intervalId: number | null = null;

function notify() {
  subscribers.forEach((cb) => {
    try { cb(state); } catch (e) { }
  });
}

async function doCheck() {
  state.isChecking = true;
  notify();

  try {
    const data = await authMe();
    sessionStorage.setItem("userId", String(data.userId));
    if (data.username) sessionStorage.setItem("username", String(data.username));
    if (data.role) sessionStorage.setItem("role", String(data.role));
    sessionStorage.setItem("lastCheckTime", Date.now().toString());

    state = { isAuthValid: true, isChecking: false, lastCheckTime: Date.now() };
  } catch (e) {
    state = { isAuthValid: false, isChecking: false, lastCheckTime: state.lastCheckTime };
  } finally {
    notify();
  }
}

function start() {
  if (initialized) return;
  initialized = true;
  void doCheck();
  intervalId = window.setInterval(doCheck, AUTH_CHECK_INTERVAL) as unknown as number;
}

export function subscribe(cb: (s: State) => void) {
  subscribers.push(cb);
  try { cb(state); } catch (e) {}
  if (!initialized) start();

  return () => {
    subscribers = subscribers.filter((c) => c !== cb);
    if (subscribers.length === 0 && intervalId != null) {
      clearInterval(intervalId);
      intervalId = null;
      initialized = false;
    }
  };
}

export function getState() { return state; }
