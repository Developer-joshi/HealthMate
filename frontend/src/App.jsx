import React from 'react'
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx'
import Doctors from './pages/Doctors';
import Login from './pages/Login';
import About from './pages/About';
import Contact from './pages/Contact';
import MyProfile from './pages/MyProfile';
import MyAppointments from './pages/MyAppointments';
import Appointment from './pages/Appointment';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import VideoRoom from './components/video/VideoRoom.jsx';
import {ToastContainer,toast} from 'react-toastify'
import 'react-toastify/ReactToastify.css'

const App = () => {
  return (
    <div className="mx=4 sm:mx-[10%]">
      <ToastContainer />
      <Navbar /> {/* Navbar visible in all the pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:speciality" element={<Doctors />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/appointment/:docId" element={<Appointment />} />
        <Route path="/video/:roomId" element={<VideoRoom />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App