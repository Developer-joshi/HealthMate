import express from 'express';
import upload from '../middleware/multer.js';
import authAdmin from '../middleware/authAdmin.js'; 
import { addDoctor } from '../controllers/adminController.js';


const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin, upload.single('image'), addDoctor)


export default adminRouter;