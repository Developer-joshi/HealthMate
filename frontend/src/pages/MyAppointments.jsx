  import React, { useContext } from 'react'
  import { AppContext } from "../context/AppContext"

  const MyAppointments = () => {
    const { doctors } = useContext(AppContext)

    return (
      <div className="mt-12">
        <p className="pb-3 text-lg font-medium text-gray-600 border-b">
          My appointments
        </p>

        <div className="space-y-4 mt-4">
          {doctors.slice(0, 4).map((item, index) => (
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
                src={item.image}
                alt={item.name}
              />

            
              <div className="flex-1 text-sm text-xinc-600">
                <p className="text-nuetral font-semibold">
                  {item.name}
                </p>
                <p>{item.speciality}</p>
                <p className="text-zinc-700 font-medium mt-1">Address:</p>
                <p className='text-xs'>{item.address.line1}</p>
                <p className='text-xs'>{item.address.line2}</p>
                <p className="text-xs mt-1">
                  <span className="text-sm text-neutral-700 font-medium">
                    Date &amp; Time:
                  </span>{" "}
                  18 June, 2025 | 8:30 PM
                </p>
              </div>

            
              <div className="flex flex-col justify-end gap-2">
                <button className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300ms">
                  Pay Online
                </button>
                <button className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300ms">
                  Cancel appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  export default MyAppointments
