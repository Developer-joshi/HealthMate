import React from 'react'
import { assets } from '../assets/assets'

const Header = () => {
  return (
    <div>

            {/* {----left side} */}
            <div>

                 <p>
                    Book Appointment 
                    <br />
                    With Trusted Doctors
                 </p>

                 <div>
                    <img src={assets.group_profiles}></img>
                    <p>simply browse through our extensive list of trusted doctors, <br/>Schedule your appointment</p>
                 </div>

                 <a href="">
                    Book appointment <img src={assets.arrow_icon}></img>
                 </a>

            </div>


            {/* {}right side */}

            <div>

                <img src={assets.header_img}></img>

            </div>
      
    </div>
  )
}

export default Header
