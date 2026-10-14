import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ doctorId: '', date: '', reason: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Get this user's appointments from the server
  async function loadAppointments() {
    try {
      setAppointments(await api('/appointments'));
    } catch (err) {
      setError(err.message);
    }
  }

  // Runs once when the page opens
  useEffect(() => {
    if (!user) return;
    loadAppointments();
    if (user.role === 'patient') {
      api('/appointments/doctors').then(setDoctors).catch((err) => setError(err.message));
    }
  }, []);

  if (!user) return <Navigate to="/login" />;

  function logout() {
    localStorage.clear();
    navigate('/login');
  }

  // Patient books a new appointment
  async function book(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api('/appointments', {
        method: 'POST',
        body: {
          doctorId: form.doctorId,
          date: new Date(form.date).toISOString(),
          reason: form.reason,
        },
      });
      setForm({ doctorId: '', date: '', reason: '' });
      setMessage('Appointment booked!');
      loadAppointments();
    } catch (err) {
      setError(err.message);
    }
  }

  // Complete or cancel an appointment
  async function updateStatus(id, status) {
    setError('');
    setMessage('');
    try {
      await api(`/appointments/${id}/status`, { method: 'PATCH', body: { status } });
      loadAppointments();
    } catch (err) {
      setError(err.message);
    }
  }

  const isDoctor = user.role === 'doctor';

  return (
    <div className="dashboard">
      <header className="topbar">
        <div>
          <h1>Hi, {user.name} 👋</h1>
          <p className="muted">{isDoctor ? 'Doctor dashboard' : 'Patient dashboard'}</p>
        </div>
        <button className="secondary" onClick={logout}>Log out</button>
      </header>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {!isDoctor && (
        <form className="panel" onSubmit={book}>
          <h2>Book an appointment</h2>
          <label>
            Doctor
            <select
              value={form.doctorId}
              onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
              required
            >
              <option value="">Choose a doctor</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} — {d.specialization}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date and time
            <input
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </label>
          <label>
            Reason
            <textarea
              rows="3"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Describe your symptoms"
            />
          </label>
          <button type="submit">Book appointment</button>
        </form>
      )}

      <section className="panel">
        <h2>{isDoctor ? 'Your patient appointments' : 'Your appointments'}</h2>

        {appointments.length === 0 && <p className="muted">No appointments yet.</p>}

        {appointments.map((a) => {
          const other = isDoctor ? a.patient : a.doctor;
          return (
            <div key={a._id} className="appointment">
              <div>
                <strong>{other.name}</strong>
                {!isDoctor && <span className="muted"> · {other.specialization}</span>}
                <p className="muted">{new Date(a.date).toLocaleString()}</p>
                {a.reason && <p className="reason">{a.reason}</p>}
              </div>
              <div className="actions">
                <span className={`badge ${a.status}`}>{a.status}</span>
                {a.status === 'scheduled' && isDoctor && (
                  <button onClick={() => updateStatus(a._id, 'completed')}>Complete</button>
                )}
                {a.status === 'scheduled' && (
                  <button className="secondary" onClick={() => updateStatus(a._id, 'cancelled')}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
