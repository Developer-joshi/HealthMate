  import React, { useContext } from 'react'
  import { AppContext } from "../context/AppContext"

  const MyAppointments = () => {
    const { backendUrl, token } = useContext(AppContext)
      
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
                {!item.cancelled && <button className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300ms">
                  Pay Online
                </button>}
                {!item.cancelled&& <button onClick={()=>cancelAppointment(item._id)} className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300ms">
                  Cancel appointment
                </button>}
                {item.cancelled && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment Cancelled</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  export default MyAppointments
