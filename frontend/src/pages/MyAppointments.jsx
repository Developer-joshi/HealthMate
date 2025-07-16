
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);

  const months = [
    " ",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return `${dateArray[0]} ${months[Number(dateArray[1])]} ${dateArray[2]}`;
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });
      if (data.success) {
        setAppointments(data.appointments.reverse());
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Appointment Payment",
      description: "Appointment Payment",
      order_id: order.id,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            backendUrl + "/api/user/verifyRazorpay",
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            { headers: { token } }
          );

          if (data.success) {
            toast.success("Payment Successful");
            getUserAppointments();
            navigate("/my-appointments");
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-razorpay",
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        initPay(data.order);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const requestOnlineMeeting = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/appointments/${appointmentId}/request-online`,
        {},
        {
          headers: { token },
        }
      );
      toast.success("Online meeting request sent");
      getUserAppointments();
    } catch (err) {
      console.log(err);
      toast.error("Failed to request meeting");
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }

    socket.on("end-call", () => {
      toast.info("Call ended by doctor");
      navigate("/my-appointments");
    });

    return () => {
      socket.off("end-call");
    };
  }, [token]);

  return (
    <div className="mt-12">
      <p className="pb-3 text-lg font-medium text-gray-600 border-b">
        My appointments
      </p>

      <div className="space-y-4 mt-4">
        {appointments.slice(0, 4).map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-3 gap-4 items-center py-2 border-b"
          >
            <img
              className="w-32 bg-indigo-50"
              src={item.docData.image}
              alt={item.docData.name}
            />

            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral font-semibold">{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className="text-zinc-700 font-medium mt-1">Address:</p>
              <p className="text-xs">{item.docData.address.line1}</p>
              <p className="text-xs">{item.docData.address.line2}</p>
              <p className="text-xs mt-1">
                <span className="text-sm text-neutral-700 font-medium">
                  Date &amp; Time:
                </span>{" "}
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>

            <div className="flex flex-col justify-end gap-2">
              {!item.cancelled && !item.payment && !item.isCompleted && (
                <button
                  onClick={() => appointmentRazorpay(item._id)}
                  className="text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-gray-100 hover:text-white transition-all duration-300 flex items-center justify-center"
                >
                  <img
                    className="max-w-20 max-h-5"
                    src={assets.razorpay_logo}
                    alt="Razorpay"
                  />
                </button>
              )}

              {!item.cancelled && item.payment && !item.isCompleted && (
                <button className="sm:min-w-48 py-2 border rounded text-[#696969] bg-[#EAEFFF]">
                  Paid
                </button>
              )}

              {item.isCompleted && (
                <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500">
                  Completed
                </button>
              )}

              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                  Cancel appointment
                </button>
              )}

              {item.cancelled && !item.isCompleted && (
                <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500">
                  Appointment cancelled
                </button>
              )}

              {item.payment &&
                !item.cancelled &&
                !item.isCompleted &&
                !item.onlineRequested && (
                  <button
                    onClick={() => requestOnlineMeeting(item._id)}
                    className="sm:min-w-48 py-2 border rounded text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300"
                  >
                    Request Online Meeting
                  </button>
                )}
              {item.onlineStatus === "rejected" && (
                <p className="text-red-500 text-sm font-medium">
                  Doctor rejected online meeting
                </p>
              )}

              {item.payment &&
                item.onlineStatus === "accepted" &&
                !item.isCompleted && (
                  <button
                    onClick={() => navigate(`/video/${item.meetingRoomId}`)}
                    className="sm:min-w-48 py-2 border rounded text-white bg-blue-500 hover:bg-blue-600 transition-all duration-300"
                  >
                    Join Now
                  </button>
                )}
                
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
