import React, { useEffect, useRef, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { toast } from "react-toastify";
import axios from "axios";
import { DoctorContext } from "../../context/DoctorContext";

const socket = io("http://localhost:4000");

const VideoRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerConnectionRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);

  const { dToken, backendUrl } = useContext(DoctorContext);

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localVideo.current.srcObject = stream;
      setLocalStream(stream);

      socket.emit("join-room", roomId);

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        remoteVideo.current.srcObject = event.streams[0];
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            roomId,
            candidate: event.candidate,
          });
        }
      };

      socket.on("offer", async (offer) => {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { roomId, answer });
      });

      socket.on("answer", async (answer) => {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on("ice-candidate", async ({ candidate }) => {
        if (candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.error("Error adding ICE candidate", err);
          }
        }
      });

      socket.on("joined", async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { roomId, offer });
      });
    };

    init();

    return () => {
      socket.disconnect();
      peerConnectionRef.current?.close();
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, [roomId]);

  const handleEndCall = async () => {
    try {
      localStream?.getTracks().forEach((track) => track.stop());
      peerConnectionRef.current?.close();

      const appointmentId = roomId.split("-")[1];

      const { data } = await axios.post(
        `${backendUrl}/api/doctor/complete-appointment`,
        { appointmentId, docId: "" }, // docId will be taken from token in backend if needed
        {
          headers: {
            dtoken: dToken,
          },
        }
      );

      socket.emit("call-ended", roomId);

      if (data.success) {
        toast.success("Call ended. Appointment marked completed.");
        window.location.href = "doctor/appointments";
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("End call error:", error);
      toast.error("Failed to end call");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gray-900 text-white">
      <h2 className="text-2xl font-bold">Meeting Room: {roomId}</h2>

      <div className="flex gap-4">
        <video
          ref={localVideo}
          autoPlay
          muted
          playsInline
          className="w-64 h-48 rounded"
        />
        <video
          ref={remoteVideo}
          autoPlay
          playsInline
          className="w-64 h-48 rounded"
        />
      </div>

      <button
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        onClick={handleEndCall}
      >
        End Call
      </button>
    </div>
  );
};

export default VideoRoom;
