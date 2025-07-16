import express from "express";
import {
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  acceptOnlineMeeting,
  rejectOnlineMeeting,
} from "../controllers/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js";


const doctorRouter = express.Router(); // Router instance

doctorRouter.get("/list", doctorList);

doctorRouter.post("/login", loginDoctor);
doctorRouter.post("/appointments", authDoctor, appointmentsDoctor);
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);
//  doctorRouter.get('/dashboard',authDoctor,doctorDashboard)

// imp : get request donot contain req.body so use post

doctorRouter.post("/dashboard", authDoctor, doctorDashboard);

doctorRouter.post("/profile", authDoctor, doctorProfile);
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);

doctorRouter.post("/appointments/:id/accept-online",authDoctor,acceptOnlineMeeting);
doctorRouter.post("/appointments/:id/reject-online",authDoctor,rejectOnlineMeeting);

export default doctorRouter;
