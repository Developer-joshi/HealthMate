// src/components/VideoRoom.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:4000"); // Backend socket server

const VideoRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerConnectionRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);

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
            console.error("Error adding received ice candidate", err);
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
      if (peerConnectionRef.current) peerConnectionRef.current.close();
    };
  }, [roomId]);

  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    navigate(-1); // or "/dashboard"
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
        onClick={handleEndCall}
        className="mt-6 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        End Call
      </button>
    </div>
  );
};

export default VideoRoom;
