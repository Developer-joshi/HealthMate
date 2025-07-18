import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
// API for doctor Login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await doctorModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);//from req and hashed passward in db

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } 
    else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {

        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;

    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.json({ success: true, message: "Availability Changed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


//API to mark appointment completed for doctor panel
const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment || appointment.docId !== docId) {
      return res.json({ success: false, message: "Cancellation failed" });
    }

    // Mark appointment as cancelled
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // Free the slot in doctor's slots_booked
    const doctor = await doctorModel.findById(docId);
    if (doctor && doctor.slots_booked) {
      const { slotDate, slotTime } = appointment;

      if (doctor.slots_booked[slotDate]) {
        doctor.slots_booked[slotDate] = doctor.slots_booked[slotDate].filter(
          (time) => time !== slotTime
        );

        // If no slots left for that day, delete the date key
        if (doctor.slots_booked[slotDate].length === 0) {
          delete doctor.slots_booked[slotDate];
        }

        await doctor.save();
      }
    }

    return res.json({
      success: true,
      message: "Appointment cancelled, slot reopened",
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};


//API TO GET DASHBOARD DATA FOR DOCTOR PANEL
const doctorDashboard = async(req,res)=>{
  try {
    const {docId} = req.body;
    
    const appointments = await appointmentModel.find({docId});

    let earnings = 0;
    appointments.map((item)=>{
      if(item.isCompleted || item.payment)
      {
        earnings+=item.amount;
      }
    })
   
    //to store unique patients
    let patients = []

    appointments.map((item)=>{
         if(!patients.includes(item.userId))
         {
            patients.push(item.userId);
         }
    })

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointment: [...appointments].reverse().slice(0, 5),
    };

    res.json({success:true,dashData});

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

//API to get doctor profile for Doctor Panel

const doctorProfile =async(req,res)=>{
  try {
    const {docId} = req.body;
    const profileData =await doctorModel.findById(docId).select('-password');
    res.json({success:true,profileData});
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

//API to update doctor profile data from doctor panel
const updateDoctorProfile = async(req,res)=>{
  try {
    const {docId , fees, address, available} = req.body;
    await doctorModel.findByIdAndUpdate(docId,{fees,address,available});
    res.json({success:true,message:'Profile Updated'});

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// Doctor accepts online meeting
const acceptOnlineMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await appointmentModel.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Optional: make sure doctor owns this appointment
    if (appointment.docId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized doctor" });
    }

    appointment.onlineStatus = "accepted";
    appointment.meetingRoomId = `room-${appointment._id}-${Date.now()}`;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Online meeting accepted",
      meetingRoomId: appointment.meetingRoomId,
    });
  } catch (error) {
    console.error("Accept meeting error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Doctor rejects online meeting
const rejectOnlineMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await appointmentModel.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.docId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized doctor" });
    }

    appointment.onlineStatus = "rejected";
    appointment.meetingRoomId = null;
    await appointment.save();

    res.status(200).json({ success: true, message: "Meeting rejected" });
  } catch (error) {
    console.error("Reject meeting error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



export {
  changeAvailability,
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

};
