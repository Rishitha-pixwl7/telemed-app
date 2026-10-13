const express = require('express');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

const router = express.Router();

// GET /api/appointments/doctors  →  list all doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('name email specialization');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/appointments  →  a patient books an appointment
router.post('/', async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can book appointments' });
    }

    const { doctorId, date, reason } = req.body;

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      date,
      reason,
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/appointments  →  see my appointments (works for patients and doctors)
router.get('/', async (req, res) => {
  try {
    const filter = req.user.role === 'doctor'
      ? { doctor: req.user.id }
      : { patient: req.user.id };

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email')
      .populate('doctor', 'name email specialization')
      .sort({ date: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/appointments/:id/status  →  mark completed or cancelled
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    // 1. Only these two changes are allowed
    if (!['completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Status must be completed or cancelled' });
    }

    // 2. Find the appointment
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // 3. Check who is asking
    const isDoctor = appointment.doctor.toString() === req.user.id;
    const isPatient = appointment.patient.toString() === req.user.id;

    if (!isDoctor && !isPatient) {
      return res.status(403).json({ message: 'Not your appointment' });
    }
    if (status === 'completed' && !isDoctor) {
      return res.status(403).json({ message: 'Only the doctor can mark it completed' });
    }

    // 4. Save the change
    appointment.status = status;
    await appointment.save();

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;