import Navbar from '@/components/ui/Navbar'
import Sidebar from '@/components/ui/Sidebar'
import React from 'react'
export const metadata = {
  title: "ConnectNow",
  description: "Video Conferencing tool",
  icons:{
    icon:'/icons/logo.svg'
  }
};


const Rootlayout = ({children}) => {
  return (
    <main className='relative'>
      <Navbar/>
      <div className='flex'>
        <Sidebar/>
        <section className='flex min-h-screen flex-1 flex-col px-6 pb-6 pt-28 max-md:pb-14 sm:px-14'>
          <div className='w-full'>
          {children}
          </div>

        </section>
      </div>
        
    </main>
  )
}

export default Rootlayout