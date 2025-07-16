import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken';
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js';
import razorpay from 'razorpay'
import appointmentModel from '../models/appointmentModel.js';


const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

//API to register the user
const registerUser = async (req,res)=>{
    try {
        const {name ,email ,password} = req.body;

        if(!name || !email || !password)
        {
            return res.json({success:false,message:'Missing Details'});
        }

        if(!validator.isEmail(email))
        {
            return res.json({success:false,message:'enter a valid email'})
        }

        if(password.length<8)
        {
            return res.json({success:false,message:'enter a strong password'})
        }

        //encrypt the passoword
        //hashing user password before storing it in database
        const salt =await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(password,salt);
        const userData = {
            name,
            email,
            password : hashedPassword
        }

        const newUser = new userModel(userData);
        const user =await newUser.save();

        const token=jwt.sign({id:user._id},process.env.JWT_SECRET);

        res.json({success:true,token});

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API for user login
const loginUser = async(req,res)=>{
    try {
        const {email ,password} = req.body;
        const user = await userModel.findOne({email})
        
        if(!user)
        {
            return res.json({success:false,message:'User does not exist'})
        }
        const isMatch = await bcrypt.compare(password,user.password)
        if(isMatch)
        {
            const token=jwt.sign({id:user._id},process.env.JWT_SECRET);
            res.json({success:true,token});
        }
        else
        {
            res.json({success:false,message:"Invalid credentials"})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API TO get user profile data
const getProfile = async (req,res)=>{
    try {
        
        // const { userId } = req.body;
        const userId = req.userId;
        const userData = await userModel.findById(userId).select('-password')

        res.json({success:true,userData});

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

//API to update user profile
const updateProfile = async(req,res)=>{
    try {
        // const {userId,name,phone,address,dob,gender} = req.body
        const userId = req.userId;
        const { name, phone, address, dob, gender } = req.body;
        const imageFile=req.file;

        if(!name || !phone || !dob || !gender)
        {
            return res.json({sucess:false,message:"data missing"})
        }
        await userModel.findByIdAndUpdate(userId,{name,phone,address:JSON.parse(address),dob,gender})

        if(imageFile)
        {
            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'});
            const imageURL=imageUpload.secure_url;
            await userModel.findByIdAndUpdate(userId,{image:imageURL})
        }

        res.json({success:true,message:'Profile updated'})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

//API to book appointment
const bookAppointment = async (req, res) => {

    try {

        // const { userId, docId, slotDate, slotTime } = req.body
        const userId = req.userId;
        const { docId, slotDate, slotTime } = req.body;
        const docData = await doctorModel.findById(docId).select("-password")

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' })
        }

        let slots_booked = docData.slots_booked

        // checking for slot availablity 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            }
            else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select("-password")

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Booked' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}
      // API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {

        // const { userId } = req.body
        const userId = req.userId;
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
     // API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {

        // const { userId, appointmentId } = req.body
        const userId = req.userId;
        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user 
        if (appointmentData.userId.toString() !== userId)
         {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctor slot 
        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
  
// API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        // creating options for razorpay payment
        const options = {
          // amount: appointmentData.amount * 100,
          amount: Number(appointmentData.amount) * 100,
          currency: process.env.CURRENCY,
          receipt: appointmentId,
          payment_capture: 1
        };

        // creation of an order
        // const order = await razorpayInstance.orders.create(options)
        const order = await razorpayInstance.orders.create(options)
//await is imp because if not done order_id is not fetched properly and quick 
        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      // Make sure receipt is the appointmentId
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
      });

      return res.json({ success: true, message: "Payment Successful" });
    } else {
      return res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// ✅ User requests online meeting after payment
const requestOnlineMeeting = async (req, res) => {
    try {
      const { id } = req.params;
      const appointment = await appointmentModel.findById(id);
  
      if (!appointment) {
        return res.status(404).json({ success: false, message: "Appointment not found" });
      }
  
      if (!appointment.payment) {
        return res.status(400).json({ success: false, message: "Payment required to request meeting" });
      }
  
      appointment.onlineRequested = true;
      appointment.onlineStatus = "pending";
      await appointment.save();
  
      res.status(200).json({ success: true, message: "Online meeting requested" });
    } catch (error) {
      console.error("Request meeting error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
  requestOnlineMeeting,
};