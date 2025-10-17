import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken'
import "dotenv/config"
import cloudinary from "cloudinary";
const SECRET = process.env.SECRET_TOKEN

export const patientRegister = async (req, res) => {
  const { firstName, lastName, email, phone, nic, dob, gender, password } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password
  ) {
    return res.status(400).send({success: false , message: "Required perameter is missing"});
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return res.status(400).send({success: false , message: "User already Registered!" })
  }
  try {
      const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role: "Patient",
  });
  res.status(201).send({success: true, message: "Successfull register"})
  } catch (error) {
    console.log("patienteRegisterError", error)
    res.status(500).send({success: false, message: "Internal server Error!"})
  }

};

export const login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).send({ success: false, message: "Required parameter is missing" });
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).send({ success: false, message: "Invalid Email or Password!" });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(400).send({ success: false, message: "Invalid Email or Password!" });
    }

    if (role !== user.role) {
      return res.status(400).send({ success: false, message: `User not found with role ${role}` });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: "5d" });

    const cookieName =
      role === "Admin" ? "adminToken" :
      role === "Doctor" ? "doctorToken" : "patientToken";

    res
      .status(200)
      .cookie(cookieName, token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      })
      .json({
        success: true,
        message: "Successfully Logged In",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    console.log("loginError", error);
    res.status(500).send({ success: false, message: "Internal server error!" });
  }
};

export const addNewAdmin = async (req, res) => {
  const { firstName, lastName, email, phone, nic, dob, gender, password } =
    req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password
  ) {
      return res.status(400).send({success: false , message: "Required perameter is missing"});
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
     return res.status(400).send({success: false , message: "Admin With This Email Already Exists!"});
  }
try{
    const admin = await User.create({
      firstName,
      lastName,
      email,
      phone,
      nic,
      dob,
      gender,
      password,
      role: "Admin",
    });
    res.status(200).json({
      success: true,
      message: "New Admin Registered",
      admin,
    });
}catch(error){
         console.log("addNewAdminError", error)
    res.status(500).send({success: false, message: "Internal server Error!"})
}
};

export const addNewDoctor = async (req, res) => {
  console.log("req.body:", req.body);
console.log("req.files:", req.files);
  if (!req.files) {
    return res.status(400).send({ success: false, message: "Doctor avatar is required" });
  }

  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(req.files.docAvatar.mimetype)) {
    return res.status(400).send({ success: false, message: "File format not supported" });
  }

  const { firstName, lastName, email, phone, nic, dob, gender, password, doctorDepartment } = req.body;

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return res.status(400).send({ success: false, message: "Doctor with this email already exists!" });
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(req.files.docAvatar.tempFilePath);

  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role: "Doctor",
    doctorDepartment,
    docAvatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "New Doctor Registered",
    doctor,
  });
};


export const getAllDoctors = async (req, res) => {
  const doctors = await User.find({ role: "Doctor" });
  res.status(200).json({
    success: true,
    doctors,
  });
};

export const getUserDetails = async (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
};

// Logout function for dashboard admin
export const logoutAdmin = async (req, res) => {
  res
    .status(201)
    .cookie("adminToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Admin Logged Out Successfully.",
    });
};

// Logout function for frontend patient
export const logoutPatient = async (req, res) => {
  res
    .status(201)
    .cookie("patientToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Patient Logged Out Successfully.",
    });
};
export const middleware = (req, res, next) => {
  const token =
    req.cookies?.adminToken ||
    req.cookies?.doctorToken ||
    req.cookies?.patientToken;

  if (!token) {
    return res.status(401).send({ success: false, message: "Unauthorized access" });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ success: false, message: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
};

export const isPatientAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies?.patientToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "Please login as a patient!" });
    }

    const decoded = jwt.verify(token, SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== "Patient") {
      return res.status(403).json({ success: false, message: "Access denied!" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("isPatientAuthenticatedError:", error);
    res.status(401).json({ success: false, message: "Invalid or expired token!" });
  }
};

// ===============================
// ADMIN AUTH
// ===============================
export const isAdminAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies?.adminToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "Please login as an admin!" });
    }

    const decoded = jwt.verify(token, SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Access denied!" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("isAdminAuthenticatedError:", error);
    res.status(401).json({ success: false, message: "Invalid or expired token!" });
  }
};
