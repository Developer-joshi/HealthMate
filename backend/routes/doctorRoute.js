import express from 'express'
import { doctorList , loginDoctor ,appointmentsDoctor, appointmentCancel,appointmentComplete} from '../controllers/doctorController.js';
import authDoctor from '../middlewares/authDoctor.js';

 const doctorRouter=express.Router(); // Router instance

 doctorRouter.get('/list',doctorList)

 doctorRouter.post('/login',loginDoctor)
 doctorRouter.get('/appoinments',authDoctor,appointmentsDoctor)
 doctorRouter.post('/complete-appointment',authDoctor,appointmentCancel);
 doctorRouter.get('/cancel-appointment',authDoctor,appointmentComplete);
 export default doctorRouter