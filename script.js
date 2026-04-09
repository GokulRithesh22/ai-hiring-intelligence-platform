const STORAGE_KEY = "momentum-tasks";
const WALKTHROUGH_KEY = "cult-task-desk-walkthrough-seen";
const CALENDAR_TOKEN_KEY = "cult-task-desk-calendar-token";
const CALENDAR_TOKEN_EXPIRY_KEY = "cult-task-desk-calendar-token-expiry";
const GOOGLE_CLIENT_ID_KEY = "cult-task-desk-google-client-id";
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskDuration = document.getElementById("taskDuration");
const taskPriority = document.getElementById("taskPriority");
const taskList = document.getElementById("taskList");
const tasksRemaining = document.getElementById("tasksRemaining");
const clearCompletedButton = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter");
const emptyStateTemplate = document.getElementById("emptyStateTemplate");
const walkthrough = document.getElementById("walkthrough");
const closeWalkthroughButton = document.getElementById("closeWalkthrough");
const showWalkthroughAgainButton = document.getElementById("showWalkthroughAgain");
const connectCalendarButton = document.getElementById("connectCalendar");
const syncCalendarButton = document.getElementById("syncCalendar");
const disconnectCalendarButton = document.getElementById("disconnectCalendar");
const calendarStatus = document.getElementById("calendarStatus");
const googleClientIdInput = document.getElementById("googleClientId");
const workMode = document.getElementById("workMode");
const nextWindow = document.getElementById("nextWindow");
const loopMessage = document.getElementById("loopMessage");

let tasks = loadTasks().map(normalizeTask);
let currentFilter = "all";
let calendarEvents = [];
let scheduleState = {
  isConnected: false,
  isSyncing: false,
  currentBusyBlock: null,
  nextFreeWindow: null,
};
let tokenClient = null;

googleClientIdInput.value = localStorage.getItem(GOOGLE_CLIENT_ID_KEY) || "";
renderTasks();
showWalkthroughIfNeeded();
restoreCalendarState();
updateCalendarUi();

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();
  if (!title) {
    return;
  }

  tasks.unshift({
    id: crypto.randomUUID(),
    title,
    duration: Number(taskDuration.value),
    priority: taskPriority.value,
    completed: false,
  });

  taskInput.value = "";
  taskDuration.value = "30";
  taskPriority.value = "medium";
  persistTasks();
  renderTasks();
  taskInput.focus();
});

taskList.addEventListener("click", (event) => {
  const target = event.target;
  const listItem = target.closest("[data-task-id]");
  if (!listItem) {
    return;
  }

  const taskId = listItem.dataset.taskId;

  if (target.matches(".delete-button")) {
    tasks = tasks.filter((task) => task.id !== taskId);
    persistTasks();
    renderTasks();
  }
});

taskList.addEventListener("change", (event) => {
  const target = event.target;
  if (!target.matches(".task-checkbox")) {
    return;
  }

  const listItem = target.closest("[data-task-id]");
  if (!listItem) {
    return;
  }

  const task = tasks.find((item) => item.id === listItem.dataset.taskId);
  if (!task) {
    return;
  }

  task.completed = target.checked;
  persistTasks();
  renderTasks();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });

    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  persistTasks();
  renderTasks();
});

googleClientIdInput.addEventListener("change", () => {
  localStorage.setItem(GOOGLE_CLIENT_ID_KEY, googleClientIdInput.value.trim());
  tokenClient = null;
  updateCalendarUi();
});

connectCalendarButton.addEventListener("click", async () => {
  try {
    await connectGoogleCalendar();
  } catch (error) {
    updateScheduleFeedback("Connection issue", "Check your Google client ID and try again.");
    console.error(error);
  }
});

syncCalendarButton.addEventListener("click", async () => {
  try {
    await syncCalendar();
  } catch (error) {
    updateScheduleFeedback("Sync failed", "Unable to read events right now.");
    console.error(error);
  }
});

disconnectCalendarButton.addEventListener("click", () => {
  disconnectCalendar();
});

closeWalkthroughButton.addEventListener("click", () => {
  hideWalkthrough();
  localStorage.setItem(WALKTHROUGH_KEY, "true");
  taskInput.focus();
});

showWalkthroughAgainButton.addEventListener("click", () => {
  hideWalkthrough();
});

walkthrough.addEventListener("click", (event) => {
  if (event.target === walkthrough) {
    hideWalkthrough();
    localStorage.setItem(WALKTHROUGH_KEY, "true");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !walkthrough.classList.contains("is-hidden")) {
    hideWalkthrough();
    localStorage.setItem(WALKTHROUGH_KEY, "true");
  }
});

function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = getVisibleTasks().filter((task) => {
    if (currentFilter === "active") {
      return !task.completed;
    }

    if (currentFilter === "completed") {
      return task.completed;
    }

    return true;
  });

  if (filteredTasks.length === 0) {
    taskList.append(emptyStateTemplate.content.cloneNode(true));
  } else {
    filteredTasks.forEach((task) => {
      taskList.append(createTaskElement(task));
    });
  }

  const activeTasks = tasks.filter((task) => !task.completed).length;
  tasksRemaining.textContent = `${activeTasks} task${activeTasks === 1 ? "" : "s"} left`;
  clearCompletedButton.disabled = !tasks.some((task) => task.completed);
  clearCompletedButton.style.opacity = clearCompletedButton.disabled ? "0.5" : "1";
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.completed ? " is-complete" : ""}`;
  item.dataset.taskId = task.id;

  const checkbox = document.createElement("input");
  checkbox.className = "task-checkbox";
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", `Mark ${task.title} as complete`);

  const copy = document.createElement("div");
  copy.className = "task-copy";

  const label = document.createElement("span");
  label.className = "task-label";
  label.textContent = task.title;

  const badges = document.createElement("div");
  badges.className = "task-badges";

  const durationBadge = createBadge(`${task.duration} min`);
  const priorityBadge = createBadge(formatPriority(task.priority));
  badges.append(durationBadge, priorityBadge);

  if (task.recommendation) {
    badges.append(createBadge(task.recommendation, true));
  }

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("aria-label", `Delete ${task.title}`);

  copy.append(label, badges);
  item.append(checkbox, copy, deleteButton);
  return item;
}

function createBadge(text, isRecommended = false) {
  const badge = document.createElement("span");
  badge.className = `task-badge${isRecommended ? " is-recommended" : ""}`;
  badge.textContent = text;
  return badge;
}

function getVisibleTasks() {
  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const rankedActiveTasks = rankTasks(activeTasks);
  return [...rankedActiveTasks, ...completedTasks];
}

function rankTasks(activeTasks) {
  if (!scheduleState.isConnected || calendarEvents.length === 0) {
    return activeTasks.map((task) => ({ ...task, recommendation: "" }));
  }

  const openMinutes = scheduleState.nextFreeWindow ? scheduleState.nextFreeWindow.minutes : 0;

  return activeTasks
    .map((task) => {
      const score = scoreTask(task, openMinutes);
      let recommendation = "";

      if (openMinutes > 0 && task.duration <= openMinutes) {
        recommendation = "Fits next free slot";
      } else if (scheduleState.currentBusyBlock) {
        recommendation = "Best kept for later";
      }

      if (task.priority === "high" && task.duration <= Math.max(openMinutes, 30)) {
        recommendation = "Close the loop next";
      }

      return {
        ...task,
        score,
        recommendation,
      };
    })
    .sort((first, second) => second.score - first.score);
}

function scoreTask(task, openMinutes) {
  const priorityWeight = {
    high: 40,
    medium: 24,
    low: 10,
  };

  let score = priorityWeight[task.priority] || 0;

  if (openMinutes > 0) {
    const fitDelta = Math.abs(openMinutes - task.duration);
    score += Math.max(0, 35 - fitDelta);

    if (task.duration <= openMinutes) {
      score += 15;
    } else {
      score -= 10;
    }
  } else if (scheduleState.currentBusyBlock) {
    score -= task.duration;
  }

  return score;
}

function showWalkthroughIfNeeded() {
  const hasSeenWalkthrough = localStorage.getItem(WALKTHROUGH_KEY) === "true";
  if (!hasSeenWalkthrough) {
    walkthrough.classList.remove("is-hidden");
    walkthrough.setAttribute("aria-hidden", "false");
  }
}

function hideWalkthrough() {
  walkthrough.classList.add("is-hidden");
  walkthrough.setAttribute("aria-hidden", "true");
}

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    return savedTasks ? JSON.parse(savedTasks) : [];
  } catch (error) {
    console.error("Unable to load saved tasks.", error);
    return [];
  }
}

function persistTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function normalizeTask(task) {
  return {
    ...task,
    duration: Number(task.duration) || 30,
    priority: task.priority || "medium",
  };
}

function formatPriority(priority) {
  return `${priority.charAt(0).toUpperCase()}${priority.slice(1)} priority`;
}

function restoreCalendarState() {
  const token = localStorage.getItem(CALENDAR_TOKEN_KEY);
  const expiry = Number(localStorage.getItem(CALENDAR_TOKEN_EXPIRY_KEY) || 0);
  const now = Date.now();

  if (token && expiry > now) {
    scheduleState.isConnected = true;
  } else if (token) {
    localStorage.removeItem(CALENDAR_TOKEN_KEY);
    localStorage.removeItem(CALENDAR_TOKEN_EXPIRY_KEY);
  }
}

function updateCalendarUi() {
  const hasClientId = Boolean(googleClientIdInput.value.trim());
  connectCalendarButton.disabled = !hasClientId;
  syncCalendarButton.disabled = !scheduleState.isConnected;
  disconnectCalendarButton.disabled = !scheduleState.isConnected;
  calendarStatus.textContent = scheduleState.isSyncing
    ? "Syncing"
    : scheduleState.isConnected
      ? "Connected"
      : "Not connected";

  if (!scheduleState.isConnected) {
    workMode.textContent = "Manual planning";
  }
}

async function connectGoogleCalendar() {
  const clientId = googleClientIdInput.value.trim();

  if (!clientId) {
    updateScheduleFeedback("Missing setup", "Add your Google OAuth Client ID first.");
    return;
  }

  if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
    updateScheduleFeedback("Google library not ready", "Reload the page and try the connection again.");
    return;
  }

  if (!tokenClient) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: CALENDAR_SCOPE,
      callback: () => {},
    });
  }

  const tokenResponse = await new Promise((resolve, reject) => {
    tokenClient.callback = (response) => {
      if (response.error) {
        reject(new Error(response.error));
        return;
      }

      resolve(response);
    };

    tokenClient.requestAccessToken({ prompt: "consent" });
  });

  const expiry = Date.now() + Number(tokenResponse.expires_in || 3600) * 1000;
  localStorage.setItem(CALENDAR_TOKEN_KEY, tokenResponse.access_token);
  localStorage.setItem(CALENDAR_TOKEN_EXPIRY_KEY, String(expiry));
  scheduleState.isConnected = true;
  updateCalendarUi();
  await syncCalendar();
}

async function syncCalendar() {
  const token = localStorage.getItem(CALENDAR_TOKEN_KEY);
  if (!token) {
    updateScheduleFeedback("Not connected", "Connect Google Calendar to sync meetings.");
    return;
  }

  scheduleState.isSyncing = true;
  updateCalendarUi();
  updateScheduleFeedback("Syncing", "Pulling today and tomorrow from Google Calendar.");

  try {
    const now = new Date();
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + 36 * 60 * 60 * 1000).toISOString();
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "50",
    });

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      disconnectCalendar();
      updateScheduleFeedback("Session expired", "Reconnect Google Calendar to keep planning around meetings.");
      return;
    }

    if (!response.ok) {
      throw new Error(`Google Calendar sync failed with status ${response.status}`);
    }

    const payload = await response.json();
    calendarEvents = mergeBusyEvents(
      (payload.items || [])
        .filter((event) => event.status !== "cancelled" && event.transparency !== "transparent")
        .map((event) => ({
          id: event.id,
          title: event.summary || "Busy",
          start: new Date(event.start.dateTime || event.start.date),
          end: new Date(event.end.dateTime || event.end.date),
        }))
        .filter((event) => !Number.isNaN(event.start.getTime()) && !Number.isNaN(event.end.getTime()))
        .sort((first, second) => first.start - second.start)
    );

    analyseSchedule();
    renderTasks();
  } finally {
    scheduleState.isSyncing = false;
    updateCalendarUi();
  }
}

function analyseSchedule() {
  const now = new Date();
  const busyEvents = calendarEvents.filter((event) => event.end > now);
  const currentBusyBlock = busyEvents.find((event) => event.start <= now && event.end > now) || null;
  const nextBusyEvent = busyEvents.find((event) => event.start > now) || null;

  let nextFreeWindow = null;

  if (currentBusyBlock) {
    const nextStartAfterCurrent = busyEvents.find((event) => event.start >= currentBusyBlock.end);
    const freeStart = currentBusyBlock.end;
    const freeEnd = nextStartAfterCurrent ? nextStartAfterCurrent.start : endOfDay(freeStart);
    nextFreeWindow = createWindow(freeStart, freeEnd);
  } else if (nextBusyEvent) {
    nextFreeWindow = createWindow(now, nextBusyEvent.start);
  } else {
    nextFreeWindow = createWindow(now, endOfDay(now));
  }

  scheduleState.currentBusyBlock = currentBusyBlock;
  scheduleState.nextFreeWindow = nextFreeWindow && nextFreeWindow.minutes > 0 ? nextFreeWindow : null;

  if (currentBusyBlock) {
    updateScheduleFeedback(
      `In meetings until ${formatTime(currentBusyBlock.end)}`,
      scheduleState.nextFreeWindow
        ? `${scheduleState.nextFreeWindow.minutes} min free after that. Best to queue short follow-ups now.`
        : "The calendar stays packed after this block, so defer longer work."
    );
  } else if (scheduleState.nextFreeWindow) {
    updateScheduleFeedback(
      `Open until ${formatTime(scheduleState.nextFreeWindow.end)}`,
      `${scheduleState.nextFreeWindow.minutes} min available. Tasks that fit this gap rise to the top.`
    );
  } else {
    updateScheduleFeedback("Day is tight", "No useful free window detected right now.");
  }
}

function mergeBusyEvents(events) {
  if (events.length === 0) {
    return [];
  }

  const merged = [events[0]];

  for (let index = 1; index < events.length; index += 1) {
    const current = events[index];
    const previous = merged[merged.length - 1];

    if (current.start <= previous.end) {
      previous.end = new Date(Math.max(previous.end.getTime(), current.end.getTime()));
      previous.title = "Busy block";
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

function createWindow(start, end) {
  const minutes = Math.max(0, Math.round((end - start) / 60000));
  return {
    start,
    end,
    minutes,
  };
}

function endOfDay(reference) {
  const date = new Date(reference);
  date.setHours(22, 0, 0, 0);
  return date;
}

function updateScheduleFeedback(modeText, messageText) {
  const freeWindow = scheduleState.nextFreeWindow;
  nextWindow.textContent = freeWindow
    ? `${formatTime(freeWindow.start)} - ${formatTime(freeWindow.end)} (${freeWindow.minutes} min)`
    : "No workable gap detected";
  workMode.textContent = modeText;
  loopMessage.textContent = messageText;
}

function disconnectCalendar() {
  localStorage.removeItem(CALENDAR_TOKEN_KEY);
  localStorage.removeItem(CALENDAR_TOKEN_EXPIRY_KEY);
  calendarEvents = [];
  scheduleState = {
    isConnected: false,
    isSyncing: false,
    currentBusyBlock: null,
    nextFreeWindow: null,
  };
  renderTasks();
  updateScheduleFeedback("Manual planning", "Tasks stay in your order until sync is enabled.");
  updateCalendarUi();
}

function formatTime(date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
