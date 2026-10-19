(() => {
  "use strict";
  const STORE_KEY = "daymark-tracker-v1";
  const $ = (selector) => document.querySelector(selector);
  const localDateKey = (date = new Date()) => {
    const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, "0"), d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };
  const makeId = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let toastTimer;
  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }
  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORE_KEY));
      if (parsed && Array.isArray(parsed.tasks) && parsed.logs && typeof parsed.logs === "object") return parsed;
    } catch (_) {}
    return { tasks: [], logs: {} };
  }
  let state = loadState();
  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
    catch (_) { toast("Could not save. Browser storage may be full or disabled."); }
  }
  function getTodayLog() {
    const key = localDateKey();
    if (!state.logs[key]) state.logs[key] = {};
    return state.logs[key];
  }
  function getHours(taskId) {
    return Number(getTodayLog()[taskId] || 0);
  }
  function formatHours(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
  }
  function setHours(taskId, value) {
    getTodayLog()[taskId] = Math.max(0, Math.round(value * 2) / 2);
    saveState();
    renderDashboard();
  }
  function renderDashboard() {
    const list = $("#task-list");
    if (!list) return;
    const now = new Date();
    const dateText = $("#date-text");
    if (dateText) dateText.textContent = now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    const dayLabel = $("#today-label");
    if (dayLabel) dayLabel.textContent = now.toLocaleDateString(undefined, { weekday: "long" }).toUpperCase() + " / YOUR DAY, YOUR PACE";
    const totalTarget = state.tasks.reduce((sum, task) => sum + Number(task.target || 0), 0);
    const totalDone = state.tasks.reduce((sum, task) => sum + getHours(task.id), 0);
    const targetsMet = state.tasks.filter(task => getHours(task.id) >= Number(task.target || 0)).length;
    $("#total-done").textContent = formatHours(totalDone);
    $("#total-target").textContent = formatHours(totalTarget);
    $("#task-count").textContent = state.tasks.length;
    $("#targets-met").textContent = targetsMet;
    $("#targets-total").textContent = state.tasks.length;
    const percent = totalTarget ? Math.round(totalDone / totalTarget * 100) : 0;
    $("#progress-percent").textContent = `${percent}%`;
    $("#overall-progress").style.width = `${Math.min(100, percent)}%`;
    $("#progress-caption").textContent = totalTarget === 0 ? "A fresh start." : percent >= 100 ? "Daily target reached. Anything extra is a bonus." : `${formatHours(Math.max(0, totalTarget - totalDone))} hours to target`;
    $("#task-count-note").textContent = state.tasks.length ? "Your list, without a fixed timetable." : "Add your first task in settings.";
    $("#empty-state").hidden = state.tasks.length > 0;
    list.hidden = state.tasks.length === 0;
    list.innerHTML = "";
    state.tasks.forEach(task => {
      const done = getHours(task.id), target = Number(task.target || 0);
      const complete = done >= target;
      const pct = target ? Math.min(100, done / target * 100) : 0;
      const card = document.createElement("article");
      card.className = `task-card${complete ? " is-complete" : ""}`;
      const info = document.createElement("div");
      info.className = "task-info";
      const titleRow = document.createElement("div");
      titleRow.className = "task-title-row";
      const check = document.createElement("span");
      check.className = "complete-check";
      check.textContent = complete ? "✓" : "";
      const title = document.createElement("span");
      title.className = "task-title";
      title.textContent = task.name;
      titleRow.append(check, title);
      const subtitle = document.createElement("p");
      subtitle.className = "task-subtitle";
      subtitle.textContent = complete ? `${formatHours(done - target)} extra hours beyond target` : `${formatHours(Math.max(0, target - done))}h left to daily target`;
      const track = document.createElement("div");
      track.className = "task-progress-track";
      const fill = document.createElement("div");
      fill.className = "task-progress-fill";
      fill.style.width = `${pct}%`;
      track.append(fill);
      info.append(titleRow, subtitle, track);
      const controls = document.createElement("div");
      controls.className = "task-controls";
      const stepper = document.createElement("div");
      stepper.className = "stepper";
      stepper.setAttribute("aria-label", `Hours logged for ${task.name}`);
      const minus = document.createElement("button");
      minus.className = "step-btn";
      minus.type = "button";
      minus.textContent = "−";
      minus.setAttribute("aria-label", `Remove half an hour from ${task.name}`);
      minus.disabled = done <= 0;
      minus.addEventListener("click", () => setHours(task.id, getHours(task.id) - 0.5));
      const readout = document.createElement("div");
      readout.className = "hours-readout";
      readout.innerHTML = `<span class="current-hours"></span><span> / </span><span class="target-hours"></span>`;
      readout.querySelector(".current-hours").textContent = formatHours(done);
      readout.querySelector(".target-hours").textContent = formatHours(target);
      const plus = document.createElement("button");
      plus.className = "step-btn";
      plus.type = "button";
      plus.textContent = "+";
      plus.setAttribute("aria-label", `Add half an hour to ${task.name}`);
      plus.addEventListener("click", () => setHours(task.id, getHours(task.id) + 0.5));
      stepper.append(minus, readout, plus);
      controls.append(stepper);
      card.append(info, controls);
      list.append(card);
    });
  }
  function renderSettings() {
    const list = $("#settings-task-list");
    if (!list) return;
    list.innerHTML = "";
    $("#settings-task-count").textContent = `${state.tasks.length} task${state.tasks.length === 1 ? "" : "s"}`;
    $("#settings-empty").hidden = state.tasks.length > 0;
    state.tasks.forEach(task => {
      const row = document.createElement("div");
      row.className = "settings-task-row";
      const name = document.createElement("div");
      name.className = "settings-task-name";
      name.textContent = task.name;
      const targetWrap = document.createElement("div");
      targetWrap.className = "target-edit-wrap";
      targetWrap.style.position = "relative";
      const target = document.createElement("input");
      target.className = "target-edit";
      target.type = "number";
      target.min = "0.5";
      target.max = "24";
      target.step = "0.5";
      target.value = task.target;
      target.setAttribute("aria-label", `Daily target for ${task.name}, in hours`);
      target.title = "Daily target in hours";
      target.addEventListener("change", () => {
        const next = Number(target.value);
        if (!Number.isFinite(next) || next < 0.5 || next > 24) {
          target.value = task.target;
          toast("Set a target between 0.5 and 24 hours.");
          return;
        }
        task.target = Math.round(next * 2) / 2;
        saveState();
        renderSettings();
        toast("Daily target updated.");
      });
      const unit = document.createElement("span");
      unit.className = "target-unit";
      unit.textContent = "h";
      targetWrap.append(target, unit);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-btn";
      remove.textContent = "×";
      remove.title = `Remove ${task.name}`;
      remove.setAttribute("aria-label", `Remove ${task.name}`);
      remove.addEventListener("click", () => {
        if (!window.confirm(`Remove "${task.name}"? Its saved hour history will also be deleted.`)) return;
        state.tasks = state.tasks.filter(item => item.id !== task.id);
        Object.keys(state.logs).forEach(day => { if (state.logs[day]) delete state.logs[day][task.id]; });
        saveState();
        renderSettings();
        toast("Task removed.");
      });
      row.append(name, targetWrap, remove);
      list.append(row);
    });
  }
  const addForm = $("#add-task-form");
  if (addForm) {
    addForm.addEventListener("submit", event => {
      event.preventDefault();
      const nameInput = $("#task-name");
      const targetInput = $("#task-target");
      const name = nameInput.value.trim();
      const target = Number(targetInput.value);
      if (!name) return;
      if (!Number.isFinite(target) || target < 0.5 || target > 24) {
        toast("Set a daily target between 0.5 and 24 hours.");
        targetInput.focus();
        return;
      }
      if (state.tasks.some(task => task.name.toLowerCase() === name.toLowerCase())) {
        toast("A task with that name already exists.");
        nameInput.focus();
        return;
      }
      state.tasks.push({ id: makeId(), name, target: Math.round(target * 2) / 2 });
      saveState();
      addForm.reset();
      targetInput.value = "3";
      renderSettings();
      toast("Task added to your dashboard.");
    });
  }
  const exportButton = $("#export-data");
  if (exportButton) exportButton.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `daymark-backup-${localDateKey()}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast("Backup exported.");
  });
  renderDashboard();
  renderSettings();
})();