  import React, { useContext,useEffect,useState } from 'react'
  import { AppContext } from "../context/AppContext"
  import { useNavigate } from 'react-router-dom'
  import axios from 'axios'
  import { toast } from 'react-toastify'
import { assets } from '../assets/assets'


  const MyAppointments = () => {
    const { backendUrl, token } = useContext(AppContext)
    const navigate = useNavigate()
      const [payment, setPayment] = useState('')
    const[appointments,setAppointments]=useState([])

    const months = [" ","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
     
    const slotDateFormat =(slotDate)=>{
      const dateArray = slotDate.split('_')
      return dateArray[0]+ " " + months[Number(dateArray[1])+ " "+dateArray[2]]
    }
    // function to setAppointment
    const getUserAppointments = async()=>{
      try{
        const{data}=await axios.get(backendUrl+'/api/user/appointments',{headers:{token}})
         
        if(data.success){
          setAppointments(data.appointments.reverse())
        }
      }catch(error){
        console.log(error);
        toast.error(error.message)
      }
    }
    // function to cancel appointment
    const cancelAppointment = async (appointmentId) => {

      try {

          const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })

          if (data.success) {
              toast.success(data.message)
              getUserAppointments()
          } else {
              toast.error(data.message)
          }

      } catch (error) {
          console.log(error)
          toast.error(error.message)
      }

  }
  const initPay = (order) => {
    const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Appointment Payment',
        description: "Appointment Payment",
        order_id: order.id,
        receipt: order.receipt,
        handler: async (response) => {

            console.log(response)

            
                try {
                    const { data } = await axios.post(backendUrl + "/api/user/verifyRazorpay", response, { headers: { token } });
                    if (data.success) {
                        navigate('/my-appointments')
                        getUserAppointments()
                    }
                } catch (error) {
                    console.log(error)
                    toast.error(error.message)
                }

        }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
};
   // Function to make payment using razorpay
   const appointmentRazorpay = async (appointmentId) => {
    try {
        const { data } = await axios.post(backendUrl + '/api/user/payment-razorpay', { appointmentId }, { headers: { token } })
        if (data.success) {
            initPay(data.order)
        }else{
            toast.error(data.message)
        }
    } catch (error) {
        console.log(error)
        toast.error(error.message)
    }
}
    useEffect(()=>{
      if(token){
        getUserAppointments()
      }
    },[token])
    return (
      <div className="mt-12">
        <p className="pb-3 text-lg font-medium text-gray-600 border-b">
          My appointments
        </p>

        <div className="space-y-4 mt-4">
          {appointments.slice(0, 4).map((item, index) => (
            <div
              key={index}
              className="
                grid 
                grid-cols-3        /* exactly 3 columns */
                gap-4 
                items-center       /* vertically center within row */
                py-2 
                border-b
              "
            >
            
              <img
                className="w-32 bg-indigo-50"
                src={item.docData.image}
                alt={item.docData.name}
              />

            
              <div className="flex-1 text-sm text-xinc-600">
                <p className="text-nuetral font-semibold">
                  {item.docData.name}
                </p>
                <p>{item.docData.speciality}</p>
                <p className="text-zinc-700 font-medium mt-1">Address:</p>
                <p className='text-xs'>{item.docData.address.line1}</p>
                <p className='text-xs'>{item.docData.address.line2}</p>
                <p className="text-xs mt-1">
                  <span className="text-sm text-neutral-700 font-medium">
                    Date &amp; Time:
                  </span>{slotDateFormat(item.slotDate)}|{item.slotTime}
                </p>
              </div>

            
              <div className="flex flex-col justify-end gap-2">
              {!item.cancelled && !item.payment && !item.isCompleted && payment !== item._id && <button onClick={() => setPayment(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>Pay Online</button>}
                            {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && <button onClick={() => appointmentStripe(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-gray-100 hover:text-white transition-all duration-300 flex items-center justify-center'><img className='max-w-20 max-h-5' src={assets.stripe_logo} alt="" /></button>}
                            {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && <button onClick={() => appointmentRazorpay(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-gray-100 hover:text-white transition-all duration-300 flex items-center justify-center'><img className='max-w-20 max-h-5' src={assets.razorpay_logo} alt="" /></button>}
                            {!item.cancelled && item.payment && !item.isCompleted && <button className='sm:min-w-48 py-2 border rounded text-[#696969]  bg-[#EAEFFF]'>Paid</button>}

                            {item.isCompleted && <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>Completed</button>}

                            {!item.cancelled && !item.isCompleted && <button onClick={() => cancelAppointment(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel appointment</button>}
                            {item.cancelled && !item.isCompleted && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment cancelled</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  export default MyAppointments
