import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>
       <div className='flex flex-auto sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        <div>
            <img className='mb-5 w-40' src={assets.logo} alt="" />
            <p className='w-full md:w-2/3 text-gray-600 leading-6'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci, incidunt molestias explicabo aspernatur veritatis laboriosam odit itaque ipsum consectetur illo numquam cupiditate facere vitae debitis?</p>
        <div>

        </div>
        <p className='text-xl font-medium mb-5'>Company</p>
         <ul className='flex flex-col gap-2 text-gray-600'>
            <li>Home</li>
            <li>About Us</li>
            <li>Contact</li>
            <li>Privacy Policy</li>
         </ul>
        <div>

        </div>
        <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
        <ul className='flex flex-col gap-2 text-gray-600'>
            <li>+1-324-654-987</li>
            <li>email@gmail.com</li>
        </ul>
      </div>
    </div>
    <div>
        <hr />
        <p className='py-5 text-sm text-center'>Copyright 2025@ All Rights Reserverd</p>
    </div>
    </div>
  )
}

export default Footer
