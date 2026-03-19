import React, { createContext, useContext, useState, useEffect } from "react";

const API = `${import.meta.env.VITE_API_URL}/api/v1`;

// ── Auth Context ──────────────────────────────────────────────
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => { if (token) fetchMe(); }, [token]);

  async function fetchMe() {
    try {
      const res = await apiFetch("/users/me");
      if (res.ok) setUser(await res.json());
      else logout();
    } catch { logout(); }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  function saveToken(t) {
    localStorage.setItem("token", t);
    setToken(t);
  }

  async function apiFetch(path, options = {}) {
    const t = localStorage.getItem("token");
    return fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
        ...(options.headers || {}),
      },
    });
  }

  return (
    <AuthContext.Provider value={{ user, token, saveToken, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

// ── Styles ────────────────────────────────────────────────────
const C = {
  bg: "#0a0a0a",
  surface: "#111111",
  surface2: "#181818",
  border: "#222222",
  text: "#eeeeee",
  muted: "#555555",
  faint: "#2a2a2a",
  accent: "#ffffff",
  pending: { bg: "#2a2410", text: "#c4a832" },
  progress: { bg: "#1a1c30", text: "#6b7fe8" },
  completed: { bg: "#162416", text: "#4caf7d" },
  admin: { bg: "#2a2018", text: "#c4a832" },
  user: { bg: "#1a1a2a", text: "#6b7fe8" },
};

const STATUS_MAP = {
  pending: { label: "Pending", dot: "#c4a832", ...C.pending },
  in_progress: { label: "In Progress", dot: "#6b7fe8", ...C.progress },
  completed: { label: "Completed", dot: "#4caf7d", ...C.completed },
};

// ── Global CSS ────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${C.bg}; color: ${C.text}; font-family: 'DM Sans', sans-serif; }
    input, select, textarea, button { font-family: inherit; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #444 !important; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fade-in { animation: fadeIn 0.2s ease forwards; }
  `}</style>
);

// ── Helpers ───────────────────────────────────────────────────
function Alert({ msg, type }) {
  if (!msg) return null;
  const map = {
    error: { bg: "#2a1414", color: "#f87171", border: "#3d1a1a" },
    success: { bg: "#162416", color: "#4caf7d", border: "#1e3a1e" },
    info: { bg: "#1a1c30", color: "#6b7fe8", border: "#252840" },
  };
  const s = map[type] || map.info;
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: s.color }}>
      {msg}
    </div>
  );
}

function Spinner() {
  return <span style={{ display: "inline-block", width: 13, height: 13, border: "1.5px solid #444", borderTop: "1.5px solid #aaa", borderRadius: "50%", animation: "spin 0.6s linear infinite", verticalAlign: "middle", marginLeft: 8 }} />;
}

function Avatar({ name, size = 32 }) {
  const initials = (name || "?").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#1e1e2e", border: `1px solid #333`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 500, color: "#6b7fe8", flexShrink: 0, fontFamily: "'DM Mono', monospace" }}>
      {initials}
    </div>
  );
}

function RoleBadge({ role }) {
  const s = role === "admin" ? C.admin : C.user;
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: s.bg, color: s.text, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {role}
    </span>
  );
}

// ── Login Page ────────────────────────────────────────────────
function LoginPage({ onSwitch }) {
  const { saveToken, apiFetch } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      const res = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) saveToken(data.access_token);
      else setMsg({ text: data.detail || "Login failed", type: "error" });
    } catch { setMsg({ text: "Network error. Please try again.", type: "error" }); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="fade-in" style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.muted, letterSpacing: "0.1em", marginBottom: 8 }}>TASK MANAGER</div>
          <div style={{ fontSize: 28, fontWeight: 300, color: C.text, letterSpacing: "-0.02em" }}>Welcome back</div>
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28 }}>
          <Alert msg={msg?.text} type={msg?.type} />
          <form onSubmit={handleSubmit}>
            <AuthInput label="Email" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
            <AuthInput label="Password" type="password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} />
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "11px", background: C.accent, color: C.bg, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
              Sign in {loading && <Spinner />}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: C.muted }}>
            No account?{" "}
            <span onClick={onSwitch} style={{ color: C.text, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>Register</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Register Page ─────────────────────────────────────────────
function RegisterPage({ onSwitch }) {
  const { saveToken, apiFetch } = useAuth();
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      const res = await apiFetch("/auth/register", { method: "POST", body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) {
        const loginRes = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email: form.email, password: form.password }) });
        const loginData = await loginRes.json();
        if (loginRes.ok) saveToken(loginData.access_token);
      } else {
        setMsg({ text: data.detail || "Registration failed", type: "error" });
      }
    } catch { setMsg({ text: "Network error. Please try again.", type: "error" }); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="fade-in" style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.muted, letterSpacing: "0.1em", marginBottom: 8 }}>TASK MANAGER</div>
          <div style={{ fontSize: 28, fontWeight: 300, color: C.text, letterSpacing: "-0.02em" }}>Create account</div>
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28 }}>
          <Alert msg={msg?.text} type={msg?.type} />
          <form onSubmit={handleSubmit}>
            <AuthInput label="Email" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
            <AuthInput label="Username" value={form.username} onChange={v => setForm(f => ({ ...f, username: v }))} />
            <AuthInput label="Password" type="password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} />
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "11px", background: C.accent, color: C.bg, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
              Register {loading && <Spinner />}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: C.muted }}>
            Have an account?{" "}
            <span onClick={onSwitch} style={{ color: C.text, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>Sign in</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthInput({ label, type = "text", value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required
        style={{ width: "100%", padding: "10px 12px", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13 }} />
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────
function Dashboard() {
  const { user, logout, apiFetch } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", status: "pending" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("tasks");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadTasks();
    if (user?.role === "admin") loadUsers();
  }, [user]);

  async function loadTasks() {
    const res = await apiFetch("/tasks/");
    if (res.ok) setTasks(await res.json());
  }

  async function loadUsers() {
    const res = await apiFetch("/users/");
    if (res.ok) setUsers(await res.json());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      const res = editId
        ? await apiFetch(`/tasks/${editId}`, { method: "PUT", body: JSON.stringify(form) })
        : await apiFetch("/tasks/", { method: "POST", body: JSON.stringify(form) });
      if (res.ok) {
        setMsg({ text: editId ? "Task updated!" : "Task created!", type: "success" });
        setForm({ title: "", description: "", status: "pending" });
        setEditId(null);
        loadTasks();
      } else {
        const d = await res.json();
        setMsg({ text: d.detail || "Error", type: "error" });
      }
    } catch { setMsg({ text: "Network error", type: "error" }); }
    setLoading(false);
  }

  async function deleteTask(id) {
    if (!window.confirm("Delete this task?")) return;
    const res = await apiFetch(`/tasks/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) { setMsg({ text: "Task deleted", type: "info" }); loadTasks(); }
  }

  function startEdit(task) {
    setEditId(task.id);
    setForm({ title: task.title, description: task.description || "", status: task.status });
    setActivePage("tasks");
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const counts = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
  };

  const navItems = [
    { id: "tasks", label: "Tasks" },
    ...(user?.role === "admin" ? [{ id: "users", label: "Users" }] : []),
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 40 }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 220, background: C.surface, borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column", padding: "24px 16px",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease",
      }}
        className="sidebar-nav"
      >
        <style>{`
          @media (min-width: 768px) { .sidebar-nav { transform: translateX(0) !important; } .hamburger { display: none !important; } .main-content { margin-left: 220px !important; } }
        `}</style>

        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.muted, letterSpacing: "0.12em", marginBottom: 32, paddingLeft: 4 }}>TASK MGR</div>

        <nav style={{ flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
              style={{ width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: 8, fontSize: 13, fontWeight: activePage === item.id ? 500 : 400, color: activePage === item.id ? C.text : C.muted, background: activePage === item.id ? C.faint : "transparent", border: "none", cursor: "pointer", marginBottom: 2, display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: activePage === item.id ? C.text : "transparent", border: `1px solid ${activePage === item.id ? C.text : C.muted}`, flexShrink: 0 }} />
              {item.label}
            </button>
          ))}
        </nav>

        <button onClick={logout} style={{ padding: "9px 12px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 12, cursor: "pointer", textAlign: "left", letterSpacing: "0.02em" }}>
          Sign out
        </button>
      </aside>

      {/* Main */}
      <main className="main-content" style={{ flex: 1, marginLeft: 0, transition: "margin 0.25s ease" }}>
        {/* Topbar */}
        <header style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.surface, position: "sticky", top: 0, zIndex: 30 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="hamburger" onClick={() => setSidebarOpen(v => !v)}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 18, padding: "2px 6px", display: "block" }}>
              ☰
            </button>
            <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>
              {activePage === "tasks" ? "Tasks" : "All Users"}
            </span>
          </div>

          {/* User info top-right */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{user?.username}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{user?.email}</div>
            </div>
            <Avatar name={user?.username} size={34} />
            <RoleBadge role={user?.role} />
          </div>
        </header>

        <div style={{ padding: "24px", maxWidth: 860, margin: "0 auto" }}>
          {activePage === "tasks" && (
            <div className="fade-in">
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
                {[
                  { label: "Total", val: counts.total, color: C.text },
                  { label: "Pending", val: counts.pending, color: "#c4a832" },
                  { label: "In progress", val: counts.in_progress, color: "#6b7fe8" },
                  { label: "Completed", val: counts.completed, color: "#4caf7d" },
                ].map(s => (
                  <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 500, color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Form */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>{editId ? "Edit task" : "New task"}</div>
                <Alert msg={msg?.text} type={msg?.type} />
                <form onSubmit={handleSubmit}>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Task title"
                    style={{ width: "100%", padding: "10px 12px", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, marginBottom: 10 }} />
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" rows={2}
                    style={{ width: "100%", padding: "10px 12px", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, resize: "vertical", marginBottom: 10, fontFamily: "inherit" }} />
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      style={{ padding: "9px 12px", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, flex: 1 }}>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button type="submit" disabled={loading}
                      style={{ padding: "9px 20px", background: C.accent, color: C.bg, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                      {editId ? "Update" : "Create"} {loading && <Spinner />}
                    </button>
                    {editId && (
                      <button type="button" onClick={() => { setEditId(null); setForm({ title: "", description: "", status: "pending" }); }}
                        style={{ padding: "9px 16px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 13, cursor: "pointer" }}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Task list */}
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
                {tasks.length} task{tasks.length !== 1 ? "s" : ""}
              </div>
              {tasks.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px 0", color: C.muted, fontSize: 14 }}>No tasks yet. Create one above.</div>
              )}
              {tasks.map(task => {
                const s = STATUS_MAP[task.status] || STATUS_MAP.pending;
                return (
                  <div key={task.id} className="fade-in" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.title}</div>
                      {task.description && <div style={{ fontSize: 12, color: C.muted, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.description}</div>}
                    </div>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.text, fontWeight: 500, flexShrink: 0 }}>{s.label}</span>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => startEdit(task)} style={{ padding: "5px 12px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, fontSize: 11, cursor: "pointer" }}>Edit</button>
                      <button onClick={() => deleteTask(task.id)} style={{ padding: "5px 12px", background: "transparent", border: `1px solid #3d1a1a`, borderRadius: 6, color: "#f87171", fontSize: 11, cursor: "pointer" }}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activePage === "users" && user?.role === "admin" && (
            <div className="fade-in">
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
                {users.length} user{users.length !== 1 ? "s" : ""}
              </div>
              {users.map(u => (
                <div key={u.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={u.username} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{u.username}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{u.email}</div>
                  </div>
                  <RoleBadge role={u.role} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────
function App() {
  const { user } = useAuth();
  const [page, setPage] = useState("login");

  if (user) return <Dashboard />;

  return page === "login"
    ? <LoginPage onSwitch={() => setPage("register")} />
    : <RegisterPage onSwitch={() => setPage("login")} />;
}

export default function Root() {
  return (
    <>
      <GlobalStyle />
      <AuthProvider><App /></AuthProvider>
    </>
  );
}