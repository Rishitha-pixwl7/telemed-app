import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    specialization: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      // 1. Create the account
      await api('/auth/register', { method: 'POST', body: form });

      // 2. Log them in right away so they don't have to type it again
      const data = await api('/auth/login', {
        method: 'POST',
        body: { email: form.email, password: form.password },
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <form className="card" onSubmit={handleSubmit}>
        <h1>Create an account</h1>
        <p className="muted">Join as a patient or a doctor</p>

        {error && <p className="error">{error}</p>}

        <label>
          I am a
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
        </label>

        <label>
          Full name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>

        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} minLength={6} required />
        </label>

        {form.role === 'doctor' && (
          <label>
            Specialization
            <input name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Cardiology" required />
          </label>
        )}

        <button type="submit">Sign up</button>
        <p className="muted">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}