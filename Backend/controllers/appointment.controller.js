
import { Appointment } from "../models/appointment.model.js";
import { User } from "../models/user.model.js";

// ===============================
// POST Appointment


// ===============================
export const postAppointment = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      nic,
      dob,
      gender,
      appointment_date,
      department,
      doctor_firstName,
      doctor_lastName,
      hasVisited,
      address,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !nic ||
      !dob ||
      !gender ||
      !appointment_date ||
      !department ||
      !doctor_firstName ||
      !doctor_lastName ||
      !address
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill the full form!" });
    }

    const doctor = await User.find({
      firstName: doctor_firstName,
      lastName: doctor_lastName,
      role: "Doctor",
      doctorDepartment: department,
    });

    if (doctor.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found!" });
    }

    if (doctor.length > 1) {
      return res.status(400).json({
        success: false,
        message:
          "Doctors Conflict! Please contact through email or phone!",
      });
    }

    const doctorId = doctor[0]._id;
    const patientId = req.user._id;

    const appointment = await Appointment.create({
      firstName,
      lastName,
      email,
      phone,
      nic,
      dob,
      gender,
      appointment_date,
      department,
      doctor: {
        firstName: doctor_firstName,
        lastName: doctor_lastName,
      },
      hasVisited,
      address,
      doctorId,
      patientId,
    });

    res.status(200).json({
      success: true,
      message: "Appointment sent successfully!",
      appointment,
    });
  } catch (error) {
    console.error("postAppointmentError:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error!" });
  }
};

// ===============================
// GET All Appointments
// ===============================
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("getAllAppointmentsError:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error!" });
  }
};

// ===============================
// UPDATE Appointment Status
// ===============================
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let appointment = await Appointment.findById(id);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found!" });
    }

    appointment = await Appointment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      message: "Appointment status updated successfully!",
    });
  } catch (error) {
    console.error("updateAppointmentStatusError:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error!" });
  }
};

// ===============================
// DELETE Appointment
// ===============================
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found!" });
    }

    await appointment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully!",
    });
  } catch (error) {
    console.error("deleteAppointmentError:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error!" });
  }
};
