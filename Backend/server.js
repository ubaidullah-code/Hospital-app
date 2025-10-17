import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import appointmentRouter from "./routes/appointment.routes.js";
import { v2 as cloudinary } from "cloudinary";
import fileUpload from "express-fileupload";

const app = express();

app.use(cors({ origin: [process.env.FRONTEND_URL_SECOND, process.env.FRONTEND_URL_FIRST], credentials: true }));
app.use(cookieParser());

// ✅ move fileUpload ABOVE express.json()
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use(express.json()); // now it's safe

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT || 5004;

mongoose.connect(process.env.DATABASE_URI);
mongoose.connection.on("connected", () => console.log("mongodb is connected"));
mongoose.connection.on("error", (error) => console.log("mongodb is not connected", error));

app.get("/", (req, res) => {
  res.send("hello world");
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/appointment", appointmentRouter);

app.listen(PORT, () => {
  console.log(`PORT is running ${PORT}`);
});
