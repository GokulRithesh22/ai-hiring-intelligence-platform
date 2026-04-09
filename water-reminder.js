const STORAGE_KEY = "hydration-loop-state";
const DAY_KEY = new Date().toLocaleDateString();

const consumedGlasses = document.getElementById("consumedGlasses");
const progressPercent = document.getElementById("progressPercent");
const nextReminder = document.getElementById("nextReminder");
const progressFill = document.getElementById("progressFill");
const reminderStatus = document.getElementById("reminderStatus");
const goalInput = document.getElementById("goalInput");
const intervalInput = document.getElementById("intervalInput");
const toggleRemindersButton = document.getElementById("toggleReminders");
const testReminderButton = document.getElementById("testReminder");
const addGlassButton = document.getElementById("addGlass");
const removeGlassButton = document.getElementById("removeGlass");
const resetDayButton = document.getElementById("resetDay");
const toast = document.getElementById("toast");

let reminderTimer = null;
let state = loadState();

goalInput.value = String(state.goal);
intervalInput.value = String(state.intervalMinutes);
render();
restoreReminderTimer();

goalInput.addEventListener("change", () => {
  state.goal = Number(goalInput.value);
  persistState();
  render();
});

intervalInput.addEventListener("change", () => {
  state.intervalMinutes = Number(intervalInput.value);
  persistState();

  if (state.remindersEnabled) {
    startReminders();
  } else {
    render();
  }
});

toggleRemindersButton.addEventListener("click", async () => {
  if (state.remindersEnabled) {
    stopReminders();
    return;
  }

  const permissionGranted = await ensureNotificationPermission();
  if (!permissionGranted) {
    showToast("Notifications are blocked. You can still use the tracker manually.");
    return;
  }

  startReminders();
  sendReminder("Hydration Loop is on", "Your water reminders are now active.");
});

testReminderButton.addEventListener("click", async () => {
  const permissionGranted = await ensureNotificationPermission();
  if (!permissionGranted) {
    showToast("Notifications are blocked. Allow them in your browser settings.");
    return;
  }

  sendReminder("Time for water", "Take a sip and log one glass when you're done.");
});

addGlassButton.addEventListener("click", () => {
  state.glasses = Math.min(state.goal, state.glasses + 1);
  persistState();
  render();

  if (state.glasses >= state.goal) {
    showToast("Daily hydration goal reached. Nice work.");
  }
});

removeGlassButton.addEventListener("click", () => {
  state.glasses = Math.max(0, state.glasses - 1);
  persistState();
  render();
});

resetDayButton.addEventListener("click", () => {
  state.glasses = 0;
  state.lastReminderAt = null;
  persistState();
  render();
  showToast("Today's hydration count has been reset.");
});

function render() {
  const progress = Math.min(100, Math.round((state.glasses / state.goal) * 100));
  consumedGlasses.textContent = `${state.glasses} / ${state.goal} glasses`;
  progressPercent.textContent = `${progress}%`;
  progressFill.style.width = `${progress}%`;
  reminderStatus.textContent = state.remindersEnabled ? "Reminders on" : "Reminders off";
  toggleRemindersButton.textContent = state.remindersEnabled ? "Pause reminders" : "Start reminders";

  if (state.remindersEnabled && state.nextReminderAt) {
    nextReminder.textContent = formatTime(new Date(state.nextReminderAt));
  } else {
    nextReminder.textContent = "Not scheduled";
  }
}

function loadState() {
  try {
    const rawState = localStorage.getItem(STORAGE_KEY);
    const parsed = rawState ? JSON.parse(rawState) : null;

    if (!parsed || parsed.day !== DAY_KEY) {
      return createDefaultState();
    }

    return {
      ...createDefaultState(),
      ...parsed,
    };
  } catch (error) {
    console.error("Unable to load hydration state.", error);
    return createDefaultState();
  }
}

function createDefaultState() {
  return {
    day: DAY_KEY,
    goal: 8,
    glasses: 0,
    intervalMinutes: 60,
    remindersEnabled: false,
    nextReminderAt: null,
    lastReminderAt: null,
  };
}

function persistState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...state,
      day: DAY_KEY,
    })
  );
}

function restoreReminderTimer() {
  if (!state.remindersEnabled || !state.nextReminderAt) {
    render();
    return;
  }

  const delay = new Date(state.nextReminderAt).getTime() - Date.now();

  if (delay <= 0) {
    triggerReminder();
    return;
  }

  scheduleReminder(delay);
}

function startReminders() {
  state.remindersEnabled = true;
  state.nextReminderAt = Date.now() + state.intervalMinutes * 60 * 1000;
  persistState();
  scheduleReminder(state.intervalMinutes * 60 * 1000);
  render();
  showToast(`Reminders started every ${state.intervalMinutes} minutes.`);
}

function stopReminders() {
  state.remindersEnabled = false;
  state.nextReminderAt = null;
  state.lastReminderAt = null;
  clearScheduledReminder();
  persistState();
  render();
  showToast("Reminders paused.");
}

function scheduleReminder(delay) {
  clearScheduledReminder();
  reminderTimer = window.setTimeout(() => {
    triggerReminder();
  }, delay);
}

function clearScheduledReminder() {
  if (reminderTimer) {
    window.clearTimeout(reminderTimer);
    reminderTimer = null;
  }
}

function triggerReminder() {
  if (!state.remindersEnabled) {
    return;
  }

  state.lastReminderAt = Date.now();
  state.nextReminderAt = Date.now() + state.intervalMinutes * 60 * 1000;
  persistState();
  render();
  sendReminder("Drink water", "Take a glass now and log it in Hydration Loop.");
  scheduleReminder(state.intervalMinutes * 60 * 1000);
}

async function ensureNotificationPermission() {
  if (!("Notification" in window)) {
    showToast("This browser does not support notifications.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

function sendReminder(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  }

  showToast(body);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("is-hidden");

  window.clearTimeout(showToast.hideTimer);
  showToast.hideTimer = window.setTimeout(() => {
    toast.classList.add("is-hidden");
  }, 3200);
}

function formatTime(date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
