import express from 'express'
import { doctorList , loginDoctor ,appointmentsDoctor, appointmentCancel,appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile} from '../controllers/doctorController.js';
import authDoctor from '../middlewares/authDoctor.js';


 const doctorRouter=express.Router(); // Router instance

 doctorRouter.get('/list',doctorList)

 doctorRouter.post('/login',loginDoctor)
 doctorRouter.post('/appointments',authDoctor,appointmentsDoctor)
 doctorRouter.post('/complete-appointment',authDoctor,appointmentCancel);
 doctorRouter.get('/cancel-appointment',authDoctor,appointmentComplete);
//  doctorRouter.get('/dashboard',authDoctor,doctorDashboard)
 doctorRouter.post("/dashboard", authDoctor, doctorDashboard);

 doctorRouter.post('/profile',authDoctor,doctorProfile);
 doctorRouter.post('/update-profile',authDoctor,updateDoctorProfile);
 export default doctorRouter