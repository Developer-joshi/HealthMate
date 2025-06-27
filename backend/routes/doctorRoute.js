import express from 'express'
import { doctorList , loginDoctor} from '../controllers/doctorController.js';

 const doctorRouter=express.Router(); // Router instance

 doctorRouter.get('/list',doctorList)

 doctorRouter.post('/login',loginDoctor)

 export default doctorRouter