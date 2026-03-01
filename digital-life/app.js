// =====================
// Utility: LocalStorage
// =====================
const store = {
  get: (key, def) => { try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; } },
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val))
};

// =====================
// Clock & Greeting
// =====================
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');
  document.getElementById('clock').textContent = `${h}:${m}:${s}`;

  const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  document.getElementById('date').textContent =
    `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  const hour = now.getHours();
  let greet = hour < 5 ? '🌙 Selamat malam' : hour < 12 ? '☀️ Selamat pagi' :
              hour < 15 ? '🌤 Selamat siang' : hour < 19 ? '🌆 Selamat sore' : '🌙 Selamat malam';
  document.getElementById('greeting').textContent = greet;
}
setInterval(updateClock, 1000);
updateClock();

// =====================
// Tasks Module
// =====================
let tasks = store.get('tasks', []);

function renderTasks() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';
  tasks.forEach((t, i) => {
    const li = document.createElement('li');
    li.className = 'task-item' + (t.done ? ' done' : '');
    li.innerHTML = `
      <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTask(${i})" />
      <span class="task-text">${escHtml(t.text)}</span>
      <span class="task-priority priority-${t.priority}">${priorityLabel(t.priority)}</span>
      <button class="task-del" onclick="deleteTask(${i})">✕</button>
    `;
    list.appendChild(li);
  });
  const active = tasks.filter(t => !t.done).length;
  document.getElementById('tasks-count').textContent = active;
}

function priorityLabel(p) {
  return p === 'high' ? '🔴' : p === 'medium' ? '🟡' : '🟢';
}

function addTask() {
  const inp = document.getElementById('task-input');
  const prio = document.getElementById('task-priority').value;
  const text = inp.value.trim();
  if (!text) return;
  tasks.unshift({ text, priority: prio, done: false, created: Date.now() });
  store.set('tasks', tasks);
  inp.value = '';
  renderTasks();
}

function toggleTask(i) {
  tasks[i].done = !tasks[i].done;
  store.set('tasks', tasks);
  renderTasks();
}

function deleteTask(i) {
  tasks.splice(i, 1);
  store.set('tasks', tasks);
  renderTasks();
}

function clearCompletedTasks() {
  tasks = tasks.filter(t => !t.done);
  store.set('tasks', tasks);
  renderTasks();
}

document.getElementById('task-input').addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

// =====================
// Habits Module
// =====================
let habits = store.get('habits', []);
const todayKey = () => new Date().toISOString().slice(0,10);

function renderHabits() {
  const list = document.getElementById('habit-list');
  const today = todayKey();
  list.innerHTML = '';
  let done = 0;
  habits.forEach((h, i) => {
    const checked = h.doneOn === today;
    if (checked) done++;
    const li = document.createElement('li');
    li.className = 'habit-item' + (checked ? ' done' : '');
    li.innerHTML = `
      <button class="habit-check ${checked ? 'checked' : ''}" onclick="toggleHabit(${i})">${checked ? '✓' : ''}</button>
      <span class="habit-name">${escHtml(h.name)}</span>
      <span style="font-size:0.72rem;color:var(--text-muted)">🔥${h.streak || 0}</span>
      <button class="task-del" onclick="deleteHabit(${i})">✕</button>
    `;
    list.appendChild(li);
  });
  document.getElementById('habits-done').textContent = `${done}/${habits.length}`;
  const pct = habits.length ? (done / habits.length * 100) : 0;
  document.getElementById('habits-progress').style.width = pct + '%';
}

function addHabit() {
  const inp = document.getElementById('habit-input');
  const name = inp.value.trim();
  if (!name) return;
  habits.push({ name, doneOn: null, streak: 0 });
  store.set('habits', habits);
  inp.value = '';
  renderHabits();
}

function toggleHabit(i) {
  const today = todayKey();
  if (habits[i].doneOn === today) {
    habits[i].doneOn = null;
    habits[i].streak = Math.max(0, (habits[i].streak || 1) - 1);
  } else {
    habits[i].doneOn = today;
    habits[i].streak = (habits[i].streak || 0) + 1;
  }
  store.set('habits', habits);
  renderHabits();
}

function deleteHabit(i) {
  habits.splice(i, 1);
  store.set('habits', habits);
  renderHabits();
}

document.getElementById('habit-input').addEventListener('keydown', e => { if (e.key === 'Enter') addHabit(); });

// =====================
// Notes Module
// =====================
const notesArea = document.getElementById('notes-area');
notesArea.value = store.get('notes', '');
notesArea.addEventListener('input', () => {
  document.getElementById('note-status').textContent = '';
});

function saveNote() {
  store.set('notes', notesArea.value);
  const s = document.getElementById('note-status');
  s.textContent = '✓ Tersimpan';
  setTimeout(() => s.textContent = '', 2000);
}

// Auto-save every 10s
setInterval(saveNote, 10000);

// =====================
// Quick Links Module
// =====================
let links = store.get('links', [
  { name: 'Google', url: 'https://google.com' },
  { name: 'YouTube', url: 'https://youtube.com' },
  { name: 'GitHub', url: 'https://github.com' },
]);

function renderLinks() {
  const grid = document.getElementById('links-grid');
  grid.innerHTML = '';
  links.forEach((l, i) => {
    const a = document.createElement('a');
    a.className = 'link-item';
    a.href = l.url;
    a.target = '_blank';
    a.rel = 'noopener';
    const domain = (() => { try { return new URL(l.url).hostname; } catch { return ''; } })();
    a.innerHTML = `
      <button class="link-del-btn" onclick="deleteLink(event,${i})">✕</button>
      <span class="link-favicon">🔗</span>
      <span>${escHtml(l.name)}</span>
    `;
    grid.appendChild(a);
  });
}

function addLink() {
  const name = document.getElementById('link-name').value.trim();
  const url = document.getElementById('link-url').value.trim();
  if (!name || !url) return;
  const finalUrl = url.startsWith('http') ? url : 'https://' + url;
  links.push({ name, url: finalUrl });
  store.set('links', links);
  document.getElementById('link-name').value = '';
  document.getElementById('link-url').value = '';
  renderLinks();
}

function deleteLink(e, i) {
  e.preventDefault();
  e.stopPropagation();
  links.splice(i, 1);
  store.set('links', links);
  renderLinks();
}

document.getElementById('link-url').addEventListener('keydown', e => { if (e.key === 'Enter') addLink(); });

// =====================
// Pomodoro Timer
// =====================
const POMODORO_FOCUS = 25 * 60;
const POMODORO_SHORT = 5 * 60;
const POMODORO_LONG  = 15 * 60;

let pomodoroRemaining = POMODORO_FOCUS;
let pomodoroRunning = false;
let pomodoroInterval = null;
let pomodoroSession = 1;
let pomodoroPhase = 'focus'; // 'focus' | 'short' | 'long'

function renderPomodoro() {
  const min = String(Math.floor(pomodoroRemaining / 60)).padStart(2,'0');
  const sec = String(pomodoroRemaining % 60).padStart(2,'0');
  document.getElementById('pomodoro-display').textContent = `${min}:${sec}`;
  document.getElementById('pomodoro-session').textContent = `Sesi ${pomodoroSession}`;
  document.getElementById('pomodoro-label').textContent =
    pomodoroPhase === 'focus' ? '🎯 Waktu Fokus' :
    pomodoroPhase === 'short' ? '☕ Istirahat Pendek' : '🛋 Istirahat Panjang';

  const dots = document.getElementById('pomodoro-dots');
  dots.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const d = document.createElement('div');
    d.className = 'p-dot' + (i < ((pomodoroSession - 1) % 4) ? ' filled' : '');
    dots.appendChild(d);
  }
}

function startPomodoro() {
  if (pomodoroRunning) return;
  pomodoroRunning = true;
  pomodoroInterval = setInterval(() => {
    pomodoroRemaining--;
    if (pomodoroRemaining <= 0) {
      clearInterval(pomodoroInterval);
      pomodoroRunning = false;
      handlePomodoroEnd();
    }
    renderPomodoro();
  }, 1000);
}

function pausePomodoro() {
  clearInterval(pomodoroInterval);
  pomodoroRunning = false;
}

function resetPomodoro() {
  clearInterval(pomodoroInterval);
  pomodoroRunning = false;
  pomodoroRemaining = POMODORO_FOCUS;
  pomodoroPhase = 'focus';
  renderPomodoro();
}

function handlePomodoroEnd() {
  if (pomodoroPhase === 'focus') {
    pomodoroSession++;
    pomodoroPhase = pomodoroSession % 4 === 1 ? 'long' : 'short';
    pomodoroRemaining = pomodoroPhase === 'long' ? POMODORO_LONG : POMODORO_SHORT;
  } else {
    pomodoroPhase = 'focus';
    pomodoroRemaining = POMODORO_FOCUS;
  }
  renderPomodoro();
  // Browser notification
  if (Notification.permission === 'granted') {
    new Notification('⏱ DigiLife Pomodoro', {
      body: pomodoroPhase === 'focus' ? 'Saatnya fokus!' : 'Waktunya istirahat!'
    });
  }
}

// Request notification permission
if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
  Notification.requestPermission();
}

// =====================
// Mood Tracker
// =====================
let moodHistory = store.get('moods', []);

function setMood(emoji, label) {
  // mark active button
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  event.currentTarget.classList.add('active');

  const entry = { emoji, label, time: new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) };
  moodHistory.unshift(entry);
  if (moodHistory.length > 20) moodHistory = moodHistory.slice(0, 20);
  store.set('moods', moodHistory);
  renderMoodHistory();
}

function renderMoodHistory() {
  const container = document.getElementById('mood-history');
  container.innerHTML = '';
  moodHistory.slice(0, 7).forEach(m => {
    const div = document.createElement('div');
    div.className = 'mood-entry';
    div.innerHTML = `<span>${m.emoji} ${m.label}</span><span>${m.time}</span>`;
    container.appendChild(div);
  });
}

// =====================
// Escape HTML
// =====================
function escHtml(str) {
  return String(str).replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>').replace(/"/g,'"');
}

// =====================
// Init
// =====================
renderTasks();
renderHabits();
renderLinks();
renderPomodoro();
renderMoodHistory();
