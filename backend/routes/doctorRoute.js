import express from 'express'
import { doctorList } from '../controllers/doctorController.js';

 const doctorRouter=express.Router(); // Router instance

 doctorRouter.get('/list',doctorList)

 export default doctorRouter