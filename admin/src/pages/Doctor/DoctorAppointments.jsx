import React from "react";
import { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    cancelAppointment,
    completeAppointment,
    backendUrl,
  } = useContext(DoctorContext);

  const { slotDateFormat, calculateAge, currency } = useContext(AppContext);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  const handleAcceptOnline = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/appointments/${appointmentId}/accept-online`,
        {},
        { headers: { dtoken: dToken } }
      );
      toast.success("Meeting accepted");
      getAppointments();
    } catch (error) {
      console.error(error);
      toast.error("Failed to accept meeting");
    }
  };

  const handleRejectOnline = async (appointmentId) => {
    try {
      await axios.post(
        `${backendUrl}/api/doctor/appointments/${appointmentId}/reject-online`,
        {},
        { headers: { dtoken: dToken } }
      );
      toast.info("Meeting rejected");
      getAppointments();
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject meeting");
    }
  };

  return (
    <div className="w-full max-w-6xl m-5 ">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll">
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>
        {[...appointments].reverse().map((item, index) => (
          <div
            className="flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
            key={index}
          >
            <p className="max-sm:hidden">{index}</p>
            <div className="flex items-center gap-2">
              <img
                src={item.userData.image}
                className="w-8 rounded-full"
                alt=""
              />
              <p>{item.userData.name}</p>
            </div>
            <div>
              <p className="text-xs inline border border-primary px-2 rounded-full">
                {item.payment ? "Online" : "CASH"}
              </p>
            </div>
            <p className="max-sm:hidden">{calculateAge(item.userData.dob)}</p>
            <p>
              {slotDateFormat(item.slotDate)}, {item.slotTime}
            </p>
            <p>
              {currency}
              {item.amount}
            </p>

            {item.cancelled ? (
              <p className="text-red-400 text-xs font-medium">Cancelled</p>
            ) : item.onlineStatus === "completed" || item.isCompleted ? (
              <p className="text-green-500 text-xs font-medium">Completed</p>
            ) : item.onlineRequested && item.onlineStatus === "pending" ? (
              <div className="flex flex-col gap-1 items-center">
                <button
                  onClick={() => handleAcceptOnline(item._id)}
                  className="text-green-600 text-xs border border-green-600 px-2 py-1 rounded hover:bg-green-600 hover:text-white"
                >
                  Accept Meet
                </button>
                <button
                  onClick={() => handleRejectOnline(item._id)}
                  className="text-red-500 text-xs border border-red-500 px-2 py-1 rounded hover:bg-red-500 hover:text-white"
                >
                  Reject Meet
                </button>
              </div>
            ) : item.onlineStatus === "accepted" && !item.isCompleted ? (
              // <a
              //   href={`/video/${item.meetingRoomId}`}
              //   target="_blank"
              //   className="text-white text-xs bg-blue-500 px-2 py-1 rounded hover:bg-blue-600"
              // >
              //   Join Now
              // </a>
              <button
                onClick={() =>
                  (window.location.href = `/video/${item.meetingRoomId}`)
                }
                className="text-white text-xs bg-blue-500 px-2 py-1 rounded hover:bg-blue-600"
              >
                Join Now
              </button>
            ) : item.onlineStatus === "rejected" ? (
              <p className="text-red-400 text-xs font-medium">
                Request Rejected
              </p>
            ) : (
              <div className="flex">
                <img
                  onClick={() => cancelAppointment(item._id)}
                  className="w-10 cursor-pointer"
                  src={assets.cancel_icon}
                  alt=""
                />
                <img
                  onClick={() => {
                    completeAppointment(item._id);
                  }}
                  className="w-10 cursor-pointer"
                  src={assets.tick_icon}
                  alt=""
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;
