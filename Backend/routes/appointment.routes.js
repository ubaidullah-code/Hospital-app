import express from "express";
import { isAdminAuthenticated, isPatientAuthenticated } from "../controllers/user.controller.js";
import { deleteAppointment, getAllAppointments, postAppointment, updateAppointmentStatus } from "../controllers/appointment.controller.js";

const appointmentRouter = express.Router();

appointmentRouter.post("/post", isPatientAuthenticated, postAppointment);
appointmentRouter.get("/getall", isAdminAuthenticated, getAllAppointments);
appointmentRouter.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus);
appointmentRouter.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);

export default appointmentRouter;
