import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

// Temporary home page — we'll turn this into the real dashboard next
function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) return <Navigate to="/login" />;

  function logout() {
    localStorage.clear();
    navigate('/login');
  }

  return (
    <div className="page">
      <h1>Hi, {user.name} 👋</h1>
      <p className="muted">You are logged in as a {user.role}.</p>
      <button onClick={logout}>Log out</button>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}