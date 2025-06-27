import express from 'express'
import { doctorList , loginDoctor ,appointmentsDoctor} from '../controllers/doctorController.js';
import authDoctor from '../middlewares/authDoctor.js';

 const doctorRouter=express.Router(); // Router instance

 doctorRouter.get('/list',doctorList)

 doctorRouter.post('/login',loginDoctor)
doctorRouter.get('/appoinments',authDoctor,appointmentsDoctor)
 export default doctorRouter