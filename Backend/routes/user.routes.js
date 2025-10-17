import express from "express";


import { addNewAdmin, addNewDoctor, getAllDoctors, getUserDetails, isAdminAuthenticated, isPatientAuthenticated, login, logoutAdmin, logoutPatient, middleware, patientRegister } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/patient/register", patientRegister);
userRouter.post("/login", login);
userRouter.post("/admin/addnew", isAdminAuthenticated, addNewAdmin);
userRouter.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);
userRouter.get("/doctors", getAllDoctors);
userRouter.get("/patient/me", isPatientAuthenticated, getUserDetails);
userRouter.get("/admin/me", isAdminAuthenticated, getUserDetails);
userRouter.get("/patient/logout", isPatientAuthenticated, logoutPatient);
userRouter.get("/admin/logout", isAdminAuthenticated, logoutAdmin);

export default userRouter;
