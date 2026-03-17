import React, { createContext, useContext, useState, useEffect } from "react";

const API = "http://127.0.0.1:8000/api/v1";

// ── Auth Context ──────────────────────────────────────────────
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) fetchMe();
  }, [token]);

  async function fetchMe() {
    try {
      const res = await apiFetch("/users/me");
      if (res.ok) setUser(await res.json());
      else logout();
    } catch {
      logout();
    }
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

// ── Helpers ───────────────────────────────────────────────────
function Alert({ msg, type }) {
  if (!msg) return null;
  const colors = { error: "#fee2e2", success: "#dcfce7", info: "#dbeafe" };
  const border = { error: "#ef4444", success: "#22c55e", info: "#3b82f6" };
  return (
    <div style={{ background: colors[type] || colors.info, border: `1px solid ${border[type] || border.info}`, borderRadius: 6, padding: "10px 14px", marginBottom: 14, fontSize: 14 }}>
      {msg}
    </div>
  );
}

function Spinner() {
  return <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid #fff", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite", verticalAlign: "middle", marginLeft: 8 }} />;
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
      if (res.ok) { saveToken(data.access_token); }
      else setMsg({ text: data.detail || "Login failed", type: "error" });
    } catch { setMsg({ text: "Network error", type: "error" }); }
    setLoading(false);
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Sign In</h2>
      <Alert msg={msg?.text} type={msg?.type} />
      <form onSubmit={handleSubmit}>
        <Input label="Email" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
        <Input label="Password" type="password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} />
        <button style={styles.btn} disabled={loading}>Login {loading && <Spinner />}</button>
      </form>
      <p style={styles.link}>No account? <span onClick={onSwitch} style={styles.linkText}>Register</span></p>
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
        // Auto-login after register
        const loginRes = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email: form.email, password: form.password }) });
        const loginData = await loginRes.json();
        if (loginRes.ok) saveToken(loginData.access_token);
      } else {
        setMsg({ text: data.detail || "Registration failed", type: "error" });
      }
    } catch { setMsg({ text: "Network error", type: "error" }); }
    setLoading(false);
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Create Account</h2>
      <Alert msg={msg?.text} type={msg?.type} />
      <form onSubmit={handleSubmit}>
        <Input label="Email" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
        <Input label="Username" value={form.username} onChange={v => setForm(f => ({ ...f, username: v }))} />
        <Input label="Password" type="password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} />
        <button style={styles.btn} disabled={loading}>Register {loading && <Spinner />}</button>
      </form>
      <p style={styles.link}>Have an account? <span onClick={onSwitch} style={styles.linkText}>Login</span></p>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────
function Dashboard() {
  const { user, logout, apiFetch } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", status: "pending" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  //useEffect(() => { loadTasks(); }, []);

  async function loadTasks() {
    const res = await apiFetch("/tasks/");
    if (res.ok) setTasks(await res.json());
  }
const [users, setUsers] = useState([]);

useEffect(() => {
  loadTasks();
  if (user?.role === "admin") {
    loadUsers();
  }
}, [user]);

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const statusColor = { pending: "#fef9c3", in_progress: "#dbeafe", completed: "#dcfce7" };
  const statusDot = { pending: "#ca8a04", in_progress: "#2563eb", completed: "#16a34a" };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#1e293b" }}>Task Dashboard</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
            {user?.username} · <span style={{ background: user?.role === "admin" ? "#fef3c7" : "#f1f5f9", color: user?.role === "admin" ? "#92400e" : "#475569", borderRadius: 4, padding: "1px 8px", fontSize: 12, fontWeight: 600 }}>{user?.role}</span>
          </p>
        </div>
        <button onClick={logout} style={{ ...styles.btn, background: "#ef4444", padding: "8px 16px", fontSize: 13 }}>Logout</button>
      </div>

      {/* Task Form */}
      <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", padding: 20, marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#1e293b" }}>{editId ? "Edit Task" : "New Task"}</h3>
        <Alert msg={msg?.text} type={msg?.type} />
        <form onSubmit={handleSubmit}>
          <Input label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} required />
          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ ...styles.input, height: 72, resize: "vertical" }} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={styles.input}>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.btn} disabled={loading}>{editId ? "Update" : "Create"} Task {loading && <Spinner />}</button>
            {editId && <button type="button" onClick={() => { setEditId(null); setForm({ title: "", description: "", status: "pending" }); }} style={{ ...styles.btn, background: "#94a3b8" }}>Cancel</button>}
          </div>
        </form>
      </div>

      {/* Task List */}
      {user?.role === "admin" && (
  <div style={{ marginTop: 40 }}>
    <h3 style={{ fontSize: 16, color: "#1e293b", marginBottom: 12 }}>
      All Users ({users.length})
    </h3>

    {users.map(u => (
      <div key={u.id} style={{
        background:"#fff",
        borderRadius:10,
        boxShadow:"0 1px 4px rgba(0,0,0,0.08)",
        padding:"12px 16px",
        marginBottom:8
      }}>
        <strong>{u.username}</strong> — {u.email} ({u.role})
      </div>
    ))}
  </div>
)}
      {tasks.length === 0 && <p style={{ color: "#94a3b8", textAlign: "center", padding: 32 }}>No tasks yet. Create one above!</p>}
      {tasks.map(task => (
        <div key={task.id} style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "14px 18px", marginBottom: 10, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: "#1e293b" }}>{task.title}</span>
              <span style={{ background: statusColor[task.status], color: statusDot[task.status], borderRadius: 20, padding: "1px 10px", fontSize: 11, fontWeight: 600 }}>{task.status.replace("_", " ")}</span>
            </div>
            {task.description && <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>{task.description}</p>}
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button onClick={() => startEdit(task)} style={{ ...styles.btn, background: "#3b82f6", padding: "5px 12px", fontSize: 12 }}>Edit</button>
            <button onClick={() => deleteTask(task.id)} style={{ ...styles.btn, background: "#ef4444", padding: "5px 12px", fontSize: 12 }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Shared Input Component ────────────────────────────────────
function Input({ label, type = "text", value, onChange, required }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        style={styles.input} />
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = {
  card: { background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.12)", padding: 32, width: "100%", maxWidth: 400 },
  title: { fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 20, textAlign: "center" },
  field: { marginBottom: 14 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 5 },
  input: { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit" },
  btn: { background: "#6366f1", color: "#fff", border: "none", borderRadius: 7, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%" },
  link: { textAlign: "center", marginTop: 16, fontSize: 13, color: "#64748b" },
  linkText: { color: "#6366f1", cursor: "pointer", fontWeight: 600 },
};

// ── App Root ──────────────────────────────────────────────────
function App() {
  const { user } = useAuth();
  const [page, setPage] = useState("login");

  if (user) return <Dashboard />;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#e0e7ff 0%,#f0fdf4 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#4f46e5", margin: 0 }}>📋 Task Manager</h1>
        <p style={{ color: "#64748b", margin: "6px 0 0" }}>Secure REST API + React Demo</p>
      </div>
      {page === "login"
        ? <LoginPage onSwitch={() => setPage("register")} />
        : <RegisterPage onSwitch={() => setPage("login")} />}
      <style>{`* { box-sizing: border-box; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function Root() {
  return <AuthProvider><App /></AuthProvider>;
}
